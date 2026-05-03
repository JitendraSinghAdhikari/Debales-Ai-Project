import { dbConnect } from "@/lib/db/connect";
import { Conversation, ProductInstance, Project } from "@/lib/db/models";
import { canViewProject } from "@/lib/access/projectAccess";
import { callAI } from "./aiService";

export async function getConversations(projectId: string, userId: string) {
  await dbConnect();
  return Conversation.find({ projectId, userId }).sort({ updatedAt: -1 }).select("-messages").lean();
}

export async function getConversation(conversationId: string, userId: string) {
  await dbConnect();
  const conv = await Conversation.findById(conversationId).lean();
  if (!conv) return null;
  if (conv.userId.toString() !== userId) return null;
  return conv;
}

export async function createConversation(projectId: string, productInstanceId: string, userId: string, title = "New Conversation") {
  await dbConnect();
  return Conversation.create({ projectId, productInstanceId, userId, title, messages: [] });
}

export async function sendMessage(conversationId: string, userId: string, content: string) {
  await dbConnect();
  const conv = await Conversation.findById(conversationId);
  if (!conv) throw new Error("Conversation not found");
  if (conv.userId.toString() !== userId) throw new Error("Forbidden");

  conv.messages.push({ role: "user", content, createdAt: new Date() });

  const productInstance = await ProductInstance.findById(conv.productInstanceId).lean();

  const history = conv.messages.slice(-10).map((m: { role: string; content: string }) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const { text, steps } = await callAI({
    messages: history,
    systemPrompt: productInstance?.systemPrompt,
    integrations: productInstance?.integrations as { type: string; enabled: boolean; mockDataKey: string; label: string }[],
  });

  conv.messages.push({ role: "assistant", content: text, steps, createdAt: new Date() });

  if (conv.messages.length === 2) {
    conv.title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
  }

  conv.updatedAt = new Date();
  await conv.save();

  return { conversation: conv, assistantMessage: { role: "assistant", content: text, steps } };
}
