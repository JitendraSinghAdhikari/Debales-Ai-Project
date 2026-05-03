"use client";
import { useProject, useCreateConversation } from "@/lib/hooks";
import { useParams, useRouter } from "next/navigation";

export default function ChatPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: projectData } = useProject(slug);
  const createConv = useCreateConversation(slug);
  const router = useRouter();

  async function handleStart() {
    if (!projectData?.instances?.[0]) return;
    const { conversation } = await createConv.mutateAsync({
      productInstanceId: projectData.instances[0]._id,
    });
    router.push(`/project/${slug}/chat/${conversation._id}`);
  }

  return (
    <div className="flex items-center justify-center h-full bg-surface-0" data-testid="chat-empty">
      <div className="text-center max-w-md px-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-700/20 border border-brand-500/20 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🤖</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">
          {projectData?.instances?.[0]?.label || "AI Assistant"}
        </h2>
        <p className="text-slate-400 mb-8 text-sm leading-relaxed">
          Your AI-powered business assistant. Ask about sales, leads, analytics, or anything about your business.
        </p>
        <button
          onClick={handleStart}
          disabled={createConv.isPending}
          className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl px-6 py-3 text-sm font-medium transition-colors"
        >
          {createConv.isPending ? "Starting..." : "Start a conversation →"}
        </button>

        {projectData?.instances && projectData.instances.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2 justify-center">
            {projectData.instances[0].integrations
              ?.filter((i: { enabled: boolean }) => i.enabled)
              .map((int: { type: string; label: string }) => (
                <span key={int.type} className="text-xs bg-surface-2 border border-surface-4 text-slate-400 px-3 py-1 rounded-full">
                  🔗 {int.label}
                </span>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
