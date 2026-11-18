import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { MongoClient } from "mongodb";

async function main() {
  const replica = await MongoMemoryReplSet.create({
    replSet: { count: 1 },
    binary: { version: "7.0.24" },
  });
  const uri = replica.getUri();
  process.env.MONGODB_URI = uri;
  process.env.JWT_SECRET = "integration-test-jwt-secret-not-for-deployment";
  process.env.STRIPE_SECRET_KEY = "sk_test_integration_not_a_real_key";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_integration_not_a_real_secret";
  process.env.BETTER_AUTH_SECRET = "integration-auth-secret-not-for-deployment";
  process.env.BETTER_AUTH_URL = "http://localhost:3000";
  const serverDir = fileURLToPath(
    new URL("../../fixmate-server/", import.meta.url),
  );
  const requireServer = createRequire(`${serverDir}package.json`);
  const mongo = new MongoClient(uri);
  let listener: import("node:http").Server | undefined;
  let passed = 0;
  async function check(name: string, fn: () => Promise<void>) {
    await fn();
    passed++;
    console.log(`PASS ${name}`);
  }
  try {
    const seeded = await promisify(execFile)(
      process.execPath,
      ["src/seed.js"],
      { cwd: serverDir, env: process.env },
    );
    console.log(seeded.stdout);
    await mongo.connect();
    const db = mongo.db("fixmate");
    const { auth } = await import("../lib/auth");
    const accounts = [
      ["admin@fixmate.com", "Admin123", "admin"],
      ["rahim@fixmate.com", "Rahim123", "technician"],
      ["sara@fixmate.com", "Sara123", "technician"],
      ["tanvir@fixmate.com", "Tanvir123", "technician"],
      ["customer@fixmate.com", "Customer123", "customer"],
      ["nusrat@fixmate.com", "Nusrat123", "customer"],
      ["mehedi@fixmate.com", "Mehedi123", "customer"],
    ];
    let customerCookie = "";
    for (const [email, password, role] of accounts)
      await check(`seeded BetterAuth login ${email}`, async () => {
        const response = await auth.api.signInEmail({
          body: { email, password },
          asResponse: true,
        });
        assert.equal(response.status, 200, await response.clone().text());
        const result = await response.json();
        assert.equal(result.user.role, role);
        if (role === "customer" && !customerCookie)
          customerCookie = response.headers
            .getSetCookie()
            .map((c) => c.split(";")[0])
            .join("; ");
      });
    await check("signup cannot create admin", async () => {
      await auth.api.signUpEmail({
        body: {
          email: "signup@fixmate.test",
          password: "Signup123",
          name: "Signup test",
          role: "admin",
        },
      });
      assert.equal(
        (await db.collection("user").findOne({ email: "signup@fixmate.test" }))
          ?.role,
        "customer",
      );
    });
    await check("BetterAuth update cannot promote customer", async () => {
      await assert.rejects(() =>
        auth.api.updateUser({
          body: { name: "Arif Updated", role: "admin" },
          headers: new Headers({ cookie: customerCookie }),
        }),
      );
      assert.equal(
        (await db.collection("user").findOne({ email: "customer@fixmate.com" }))
          ?.role,
        "customer",
      );
    });
    const app = requireServer("./index.js");
    listener = app.listen(0, "127.0.0.1");
    await new Promise<void>((resolve) => listener!.once("listening", resolve));
    const address = listener!.address() as import("node:net").AddressInfo;
    const base = `http://127.0.0.1:${address.port}`;
    const jwt = requireServer("jsonwebtoken");
    async function request(
      path: string,
      email?: string,
      method = "GET",
      body?: unknown,
    ) {
      return fetch(base + path, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(email
            ? {
                Authorization: `Bearer ${jwt.sign({ email, role: "admin" }, process.env.JWT_SECRET)}`,
              }
            : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
    }
    let serviceId: string;
    await check(
      "serverless-style import initializes database before routes",
      async () => {
        const res = await request("/api/services");
        assert.equal(res.status, 200);
        const result = await res.json();
        assert.equal(result.total, 14);
        assert.ok(
          result.data.every(
            (s: { approvalStatus: string; isAvailable: boolean }) =>
              s.approvalStatus === "approved" && s.isAvailable,
          ),
        );
        serviceId = result.data[0]._id;
      },
    );
    await check("API requires authentication", async () => {
      assert.equal((await request("/api/bookings/my")).status, 401);
    });
    await check("database role overrides forged token role", async () => {
      assert.equal(
        (await request("/api/admin/users", "customer@fixmate.com")).status,
        403,
      );
    });
    await check("technician cannot send repair requests", async () => {
      assert.equal(
        (await request("/api/bookings", "rahim@fixmate.com", "POST", {}))
          .status,
        403,
      );
    });
    await check("admin cannot send repair requests", async () => {
      assert.equal(
        (await request("/api/bookings", "admin@fixmate.com", "POST", {}))
          .status,
        403,
      );
    });
    const body = {
      serviceId: "",
      customerPhone: "+8801700000000",
      address: "Test address, Dhaka",
      preferredDate: "2030-01-01",
      problemDescription:
        "The device is not working and needs a full inspection.",
      customerEmail: "attacker@fixmate.test",
    };
    await check("duplicate request returns exact 409 message", async () => {
      const service = await db
        .collection("services")
        .findOne({ title: "Smartphone Screen Replacement" });
      const res = await request(
        "/api/bookings",
        "customer@fixmate.com",
        "POST",
        { ...body, serviceId: String(service!._id) },
      );
      assert.equal(res.status, 409);
      assert.equal(
        (await res.json()).message,
        "You already have an active request for this service",
      );
    });
    let bookingId = "";
    await check(
      "concurrent requests create only one active booking and use token identity",
      async () => {
        const responses = await Promise.all([
          request("/api/bookings", "customer@fixmate.com", "POST", {
            ...body,
            serviceId: serviceId!,
          }),
          request("/api/bookings", "customer@fixmate.com", "POST", {
            ...body,
            serviceId: serviceId!,
          }),
        ]);
        assert.deepEqual(responses.map((r) => r.status).sort(), [201, 409]);
        const created = await responses.find((r) => r.status === 201)!.json();
        bookingId = created._id;
        assert.equal(created.customerEmail, "customer@fixmate.com");
      },
    );
    await check("customer cancels only a requested booking", async () => {
      assert.equal(
        (
          await request(
            `/api/bookings/${bookingId}/cancel`,
            "customer@fixmate.com",
            "PATCH",
          )
        ).status,
        200,
      );
      assert.equal(
        (
          await request(
            `/api/bookings/${bookingId}/cancel`,
            "customer@fixmate.com",
            "PATCH",
          )
        ).status,
        400,
      );
    });
    await check("admin cannot change own role", async () => {
      const admin = await db
        .collection("user")
        .findOne({ email: "admin@fixmate.com" });
      assert.equal(
        (
          await request(
            `/api/admin/users/${admin!._id}/role`,
            "admin@fixmate.com",
            "PATCH",
            { role: "customer" },
          )
        ).status,
        400,
      );
    });
    await check("service edit resets approval", async () => {
      const service = await db
        .collection("services")
        .findOne({
          technicianEmail: "rahim@fixmate.com",
          approvalStatus: "approved",
        });
      const res = await request(
        `/api/services/${service!._id}`,
        "rahim@fixmate.com",
        "PATCH",
        { title: "Updated repair listing" },
      );
      assert.equal(res.status, 200);
      assert.equal((await res.json()).approvalStatus, "pending");
      assert.equal(
        (await request(`/api/services/${service!._id}`)).status,
        404,
      );
    });
    await check(
      "checkout refuses incomplete bookings without contacting Stripe",
      async () => {
        const b = await db
          .collection("bookings")
          .findOne({
            status: "requested",
            customerEmail: "customer@fixmate.com",
          });
        assert.equal(
          (
            await request(
              "/api/payments/create-checkout-session",
              "customer@fixmate.com",
              "POST",
              { bookingId: String(b!._id), amount: 1 },
            )
          ).status,
          400,
        );
      },
    );
    const { handleSuccessfulPayment } = requireServer(
      "./src/utils/paymentHandler.js",
    );
    const completed = await db
      .collection("bookings")
      .findOne({ status: "completed", paymentStatus: "unpaid" });
    const session = {
      id: "cs_test_integration",
      payment_status: "paid",
      currency: "usd",
      amount_total: Math.round(completed!.finalAmount * 100),
      payment_intent: "pi_test_integration",
      metadata: {
        bookingId: String(completed!._id),
        customerEmail: completed!.customerEmail,
      },
    };
    await check("concurrent payment recording is idempotent", async () => {
      await Promise.all([
        handleSuccessfulPayment(session),
        handleSuccessfulPayment(session),
      ]);
      assert.equal(
        await db
          .collection("payments")
          .countDocuments({ stripeSessionId: session.id }),
        1,
      );
      assert.equal(
        (await db.collection("bookings").findOne({ _id: completed!._id }))
          ?.paymentStatus,
        "paid",
      );
    });
    await check(
      "receipt retry repairs interrupted booking update",
      async () => {
        await db
          .collection("bookings")
          .updateOne(
            { _id: completed!._id },
            { $set: { paymentStatus: "unpaid" } },
          );
        await handleSuccessfulPayment(session);
        assert.equal(
          (await db.collection("bookings").findOne({ _id: completed!._id }))
            ?.paymentStatus,
          "paid",
        );
      },
    );
    await check("payment handler rejects mismatched amounts", async () => {
      await assert.rejects(() =>
        handleSuccessfulPayment({ ...session, amount_total: 1 }),
      );
    });
    await check(
      "technician advances real booking through completion",
      async () => {
        const b = await db
          .collection("bookings")
          .findOne({ status: "requested" });
        for (const status of ["accepted", "in-progress", "completed"]) {
          const res = await request(
            `/api/bookings/${b!._id}/status`,
            b!.technicianEmail,
            "PATCH",
            { status, finalAmount: 73.25 },
          );
          assert.equal(res.status, 200, await res.clone().text());
          assert.equal((await res.json()).status, status);
        }
        const updated = await db
          .collection("bookings")
          .findOne({ _id: b!._id });
        assert.equal(updated!.finalAmount, 73.25);
        assert.equal(updated!.statusHistory.length, 4);
      },
    );
    await check("admin approval restores public listing", async () => {
      const service = await db
        .collection("services")
        .findOne({ title: "Updated repair listing" });
      const res = await request(
        `/api/admin/services/${service!._id}/approval`,
        "admin@fixmate.com",
        "PATCH",
        { approvalStatus: "approved" },
      );
      assert.equal(res.status, 200);
      assert.equal(
        (await request(`/api/services/${service!._id}`)).status,
        200,
      );
    });
    await check(
      "database role changes apply to an existing token immediately",
      async () => {
        const token = jwt.sign(
          { email: "rahim@fixmate.com", role: "technician" },
          process.env.JWT_SECRET,
        );
        const u = await db
          .collection("user")
          .findOne({ email: "rahim@fixmate.com" });
        assert.equal(
          (
            await request(
              `/api/admin/users/${u!._id}/role`,
              "admin@fixmate.com",
              "PATCH",
              { role: "customer" },
            )
          ).status,
          200,
        );
        const res = await fetch(base + "/api/services/mine", {
          headers: { Authorization: `Bearer ${token}` },
        });
        assert.equal(res.status, 403);
      },
    );
    const Stripe = requireServer("stripe");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const webhookBody = JSON.stringify({
      id: "evt_test_integration",
      object: "event",
      type: "checkout.session.completed",
      data: { object: session },
    });
    await check(
      "signed webhook accepts retries without duplicate receipts",
      async () => {
        const signature = stripe.webhooks.generateTestHeaderString({
          payload: webhookBody,
          secret: process.env.STRIPE_WEBHOOK_SECRET,
        });
        for (let i = 0; i < 2; i++) {
          const res = await fetch(base + "/api/payments/webhook", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Stripe-Signature": signature,
            },
            body: webhookBody,
          });
          assert.equal(res.status, 200, await res.text());
        }
        assert.equal(
          await db
            .collection("payments")
            .countDocuments({ bookingId: completed!._id }),
          1,
        );
      },
    );
    await check("webhook rejects a forged signature", async () => {
      const signature = stripe.webhooks.generateTestHeaderString({
        payload: webhookBody,
        secret: "wrong-secret",
      });
      const res = await fetch(base + "/api/payments/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Stripe-Signature": signature,
        },
        body: webhookBody,
      });
      assert.equal(res.status, 400);
    });
    await check("admin statistics and transactions agree", async () => {
      const stats = await (
        await request("/api/admin/stats", "admin@fixmate.com")
      ).json();
      const payments = await (
        await request("/api/admin/payments", "admin@fixmate.com")
      ).json();
      assert.equal(stats.totalRevenue, payments.totalRevenue);
      assert.equal(stats.totalServices, 19);
    });
    console.log(
      `\n${passed} integration checks passed. No external database or Stripe requests used.`,
    );
  } finally {
    if (listener)
      await new Promise<void>((resolve) => listener!.close(() => resolve()));
    await mongo.close();
    try {
      await requireServer("./src/config/db").closeDB();
    } catch {}
    await replica.stop();
  }
}
main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
