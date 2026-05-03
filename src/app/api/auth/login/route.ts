import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/db/connect";
import { User } from "@/lib/db/models";
import { LoginSchema } from "@/lib/validations/schemas";
import { createSessionCookie, SESSION_COOKIE_NAME } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

    await dbConnect();
    const user = await User.findOne({ email: parsed.data.email }).lean();
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    // Simple hash check (demo: password === passwordHash for seeded users)
    const isValid = user.passwordHash === parsed.data.password || user.passwordHash === `hash_${parsed.data.password}`;
    if (!isValid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const session = { userId: user._id.toString(), email: user.email, name: user.name };
    const cookieValue = createSessionCookie(session);

    cookies().set(SESSION_COOKIE_NAME, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({ user: session });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
