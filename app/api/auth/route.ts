import { NextResponse } from "next/server";
import { cookies } from "next/headers";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "image-processor-auth-salt");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(request: Request) {
  const { password } = await request.json();
  const appPassword = process.env.APP_PASSWORD;

  if (!appPassword) {
    return NextResponse.json(
      { error: "APP_PASSWORD not configured" },
      { status: 500 }
    );
  }

  if (password !== appPassword) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const token = await hashPassword(appPassword);
  const cookieStore = await cookies();

  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return NextResponse.json({ success: true });
}
