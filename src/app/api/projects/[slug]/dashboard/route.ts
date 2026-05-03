import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getDashboardConfig, updateDashboardConfig, getProjectStats, getProjectBySlug } from "@/lib/services/projectService";
import { UpdateDashboardConfigSchema } from "@/lib/validations/schemas";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const project = await getProjectBySlug(params.slug, session.userId);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const config = await getDashboardConfig(project._id.toString(), session.userId);
  if (!config) return NextResponse.json({ error: "Forbidden - admin only" }, { status: 403 });

  const stats = await getProjectStats(project._id.toString());

  const { Conversation, ProductInstance } = await import("@/lib/db/models");
  const recentConversations = await Conversation.find({ projectId: project._id })
    .sort({ updatedAt: -1 })
    .limit(5)
    .select("title updatedAt userId messages")
    .lean();

  const instances = await ProductInstance.find({ projectId: project._id }).lean();

  return NextResponse.json({ config, stats, recentConversations, instances });
}

export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const project = await getProjectBySlug(params.slug, session.userId);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = UpdateDashboardConfigSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

  const updated = await updateDashboardConfig(project._id.toString(), session.userId, parsed.data);
  if (!updated) return NextResponse.json({ error: "Forbidden - admin only" }, { status: 403 });

  return NextResponse.json({ config: updated });
}
