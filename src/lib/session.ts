import { cookies } from "next/headers";
import type { SessionUser } from "@/types";

const SESSION_COOKIE = "debales_session";

export function getSession(): SessionUser | null {
  try {
    const cookieStore = cookies();
    const val = cookieStore.get(SESSION_COOKIE)?.value;
    if (!val) return null;
    return JSON.parse(Buffer.from(val, "base64").toString("utf8")) as SessionUser;
  } catch {
    return null;
  }
}

export function createSessionCookie(user: SessionUser): string {
  return Buffer.from(JSON.stringify(user)).toString("base64");
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
