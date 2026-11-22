import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient, type Db } from "mongodb";

// Serverless-safe Mongo connection.
// If the driver ever closes its topology (for example after one failed connection
// attempt), a normal module-level client stays dead until the function restarts and
// every request fails with "Topology is closed". Here the client is recreated
// automatically, and every database call always uses the current live client.
const globalForMongo = globalThis as unknown as { _fixmateMongo?: MongoClient };

function createClient(): MongoClient {
  const c = new MongoClient(process.env.MONGODB_URI as string, {
    maxPoolSize: 5,
    minPoolSize: 0,
    maxIdleTimeMS: 10000,
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000,
    retryReads: true,
    retryWrites: true,
  });
  c.on("topologyClosed", () => {
    if (globalForMongo._fixmateMongo === c) {
      globalForMongo._fixmateMongo = createClient();
    }
  });
  return c;
}

function getClient(): MongoClient {
  if (!globalForMongo._fixmateMongo) {
    globalForMongo._fixmateMongo = createClient();
  }
  return globalForMongo._fixmateMongo;
}

// A Db look-alike that resolves the live client on every call.
const db = new Proxy({} as Db, {
  get(_target, prop) {
    const real = getClient().db("fixmate") as unknown as Record<
      string | symbol,
      unknown
    >;
    const value = real[prop];
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(real)
      : value;
  },
});

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  // Production client URL must be trusted.
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    "https://fixmate-asad.vercel.app",
    "http://localhost:3000",
  ],
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 6,
  },
  socialProviders:
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : undefined,
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: true,
      },
      phone: { type: "string", required: false, input: true },
      area: { type: "string", required: false, input: true },
      bio: { type: "string", required: false, input: true },
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Only customer or technician can sign up. Anything else becomes customer.
        // Admin accounts are created by seeding, never through sign-up.
        before: async (user) => {
          const role = user.role === "technician" ? "technician" : "customer";
          return { data: { ...user, role } };
        },
      },
      update: {
        before: async (updates) => {
          // Account roles are changed only through the admin API.
          if ("role" in updates) {
            throw new APIError("FORBIDDEN", {
              message: "Roles can only be changed by an administrator.",
            });
          }
          return { data: updates };
        },
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh once a day
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
