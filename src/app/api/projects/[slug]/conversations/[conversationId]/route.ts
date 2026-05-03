import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getConversation, sendMessage } from "@/lib/services/conversationService";

export async function GET(req: NextRequest, { params }: { params: { slug: string; conversationId: string } }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const conversation = await getConversation(params.conversationId, session.userId);
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ conversation });
}

export async function POST(req: NextRequest, { params }: { params: { slug: string; conversationId: string } }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const body = await req.json();
  if (!body.content) return NextResponse.json({ error: "Content required" }, { status: 400 });

  try {
    const result = await sendMessage(params.conversationId, session.userId, body.content);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error";
    if (msg === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
