import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getConversations, createConversation } from "@/lib/services/conversationService";
import { getProjectBySlug } from "@/lib/services/projectService";
import { CreateConversationSchema } from "@/lib/validations/schemas";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const project = await getProjectBySlug(params.slug, session.userId);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const conversations = await getConversations(project._id.toString(), session.userId);
  return NextResponse.json({ conversations });
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const project = await getProjectBySlug(params.slug, session.userId);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = CreateConversationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const conversation = await createConversation(project._id.toString(), parsed.data.productInstanceId, session.userId, parsed.data.title);
  return NextResponse.json({ conversation }, { status: 201 });
}
