"use client";
import { useProject, useMe, useConversations, useCreateConversation, useLogout } from "@/lib/hooks";
import { useParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const slug = params.slug as string;
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { data: meData, isLoading: meLoading } = useMe();
  const { data: projectData, isLoading } = useProject(slug);
  const { data: convsData } = useConversations(slug);
  const createConv = useCreateConversation(slug);
  const logout = useLogout();

  useEffect(() => {
    if (!meLoading && !meData?.user) router.push("/login");
  }, [meData, meLoading, router]);

  const isAdmin = projectData?.role === "admin";
  const isAdminRoute = pathname.includes("/admin");

  async function handleNewChat() {
    if (!projectData?.instances?.[0]) return;
    const { conversation } = await createConv.mutateAsync({
      productInstanceId: projectData.instances[0]._id,
      title: "New Conversation",
    });
    router.push(`/project/${slug}/chat/${conversation._id}`);
  }

  if (meLoading || isLoading) {
    return (
      <div className="min-h-screen bg-surface-0 flex items-center justify-center">
        <div className="flex gap-2">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-brand-500 typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-surface-0 overflow-hidden" data-testid="project-layout">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-0"} flex-shrink-0 transition-all duration-300 overflow-hidden flex flex-col bg-surface-1 border-r border-surface-3`}>
        {/* Header */}
        <div className="p-4 border-b border-surface-3">
          <Link href="/projects" className="flex items-center gap-2 mb-3 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-xs">D</div>
            <span className="text-sm font-semibold text-white">Debales AI</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white font-semibold text-sm">
              {projectData?.project?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{projectData?.project?.name}</div>
              <div className="text-xs text-slate-500">{projectData?.role}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {/* Chat section */}
          <div className="mb-4">
            <button
              onClick={handleNewChat}
              disabled={createConv.isPending}
              className="w-full flex items-center gap-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
            >
              <span className="text-base">✏️</span>
              New Chat
            </button>
          </div>

          {/* Conversations */}
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider px-2 mb-2">Recent Chats</div>
            {convsData?.conversations?.length === 0 && (
              <div className="text-xs text-slate-600 px-2 py-2">No conversations yet</div>
            )}
            {convsData?.conversations?.slice(0, 10).map((conv: { _id: string; title: string; updatedAt: string }) => {
              const isActive = pathname.includes(conv._id);
              return (
                <Link key={conv._id} href={`/project/${slug}/chat/${conv._id}`}>
                  <div className={`px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors truncate ${isActive ? "bg-brand-900/50 text-brand-300" : "text-slate-400 hover:bg-surface-3 hover:text-white"}`}>
                    {conv.title}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Admin section */}
          {isAdmin && (
            <div className="mt-4 pt-4 border-t border-surface-3">
              <div className="text-xs text-slate-500 uppercase tracking-wider px-2 mb-2">Admin</div>
              <Link href={`/project/${slug}/admin`}>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${isAdminRoute ? "bg-brand-900/50 text-brand-300" : "text-slate-400 hover:bg-surface-3 hover:text-white"}`}>
                  <span>📊</span> Dashboard
                </div>
              </Link>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-surface-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500 truncate">{meData?.user?.name}</div>
            <button
              onClick={() => logout.mutate()}
              className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex-shrink-0 h-12 border-b border-surface-3 flex items-center px-4 gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-500 hover:text-white transition-colors p-1"
          >
            ☰
          </button>
          <span className="text-sm text-slate-400">
            {isAdminRoute ? "Admin Dashboard" : "AI Chat"}
          </span>
        </div>
        <main className="flex-1 overflow-hidden" data-testid="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
