import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getProjectBySlug, getProductInstances } from "@/lib/services/projectService";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const project = await getProjectBySlug(params.slug, session.userId);
  if (!project) return NextResponse.json({ error: "Project not found or access denied" }, { status: 404 });

  const instances = await getProductInstances(project._id.toString());

  // Include role info
  const member = project.members.find((m: { userId: { toString(): string } }) => m.userId.toString() === session.userId);

  return NextResponse.json({ project, instances, role: member?.role ?? "member" });
}
