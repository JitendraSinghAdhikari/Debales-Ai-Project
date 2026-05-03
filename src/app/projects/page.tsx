"use client";
import { useProjects, useMe, useLogout } from "@/lib/hooks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProjectsPage() {
  const { data: meData, isLoading: meLoading } = useMe();
  const { data, isLoading } = useProjects();
  const logout = useLogout();
  const router = useRouter();

  useEffect(() => {
    if (!meLoading && !meData?.user) router.push("/login");
  }, [meData, meLoading, router]);

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
    <div className="min-h-screen bg-surface-0" data-testid="projects-page">
      {/* Header */}
      <header className="border-b border-surface-3 glass sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm">D</div>
            <span className="text-lg font-semibold text-white">Debales AI</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">{meData?.user?.name}</span>
            <button
              onClick={() => logout.mutate()}
              className="text-xs text-slate-500 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-3"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Your Workspaces</h1>
          <p className="text-slate-400">Select a project to access AI assistants and tools</p>
        </div>

        {!data?.projects?.length ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-3 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🏗️</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No projects found</h3>
            <p className="text-slate-400 text-sm">Run the seed script to create demo projects.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.projects.map((project: { _id: string; slug: string; name: string; description?: string; members: { userId: string; role: string }[] }) => {
              const myRole = project.members.find((m) => m.userId === meData?.user?.userId)?.role;
              return (
                <Link key={project._id} href={`/project/${project.slug}`} data-testid={`project-card-${project.slug}`}>
                  <div className="glass rounded-2xl p-6 hover:border-brand-500/40 transition-all group cursor-pointer h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 transition-transform">
                        {project.name.charAt(0)}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${myRole === "admin" ? "bg-brand-900/50 text-brand-300 border border-brand-700/30" : "bg-surface-3 text-slate-400"}`}>
                        {myRole}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-brand-300 transition-colors">{project.name}</h3>
                    <p className="text-sm text-slate-400 mb-4">{project.description || "AI-powered workspace"}</p>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <span>{project.members.length} member{project.members.length !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
