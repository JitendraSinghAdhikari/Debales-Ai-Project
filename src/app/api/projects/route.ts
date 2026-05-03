import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getUserProjects } from "@/lib/services/projectService";

export async function GET() {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const projects = await getUserProjects(session.userId);
  return NextResponse.json({ projects });
}
