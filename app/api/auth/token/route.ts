import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import { auth } from "@/lib/auth";

// Signs a short-lived JWT from the BetterAuth session.
// The Express server verifies this token and re-reads the role from the DB.
export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as { role?: string }).role || "customer";

  const token = jwt.sign(
    { email: session.user.email, role },
    process.env.JWT_SECRET as string,
    { expiresIn: "15m" },
  );

  return NextResponse.json({ token });
}
