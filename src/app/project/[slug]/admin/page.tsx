"use client";
import { useDashboard, useProject } from "@/lib/hooks";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import type { IDashboardSection, IDashboardWidget } from "@/types";

// ── Widget Components ──────────────────────────────────────────────────────

function StatCard({ widget, stats }: { widget: IDashboardWidget; stats: Record<string, number | string> }) {
  const cfg = widget.config as { valueKey?: string; icon?: string; color?: string } || {};
  const value = stats?.[cfg.valueKey || ""] ?? "—";
  const colorMap: Record<string, string> = {
    brand: "from-brand-600 to-brand-800",
    green: "from-emerald-600 to-emerald-800",
    purple: "from-purple-600 to-purple-800",
    orange: "from-orange-600 to-orange-800",
  };
  const gradient = colorMap[cfg.color || "brand"];
  const icons: Record<string, string> = { MessageSquare: "💬", TrendingUp: "📈", Zap: "⚡", Users: "👥" };
  const icon = icons[cfg.icon || ""] || "📊";

  return (
    <div className="glass rounded-2xl p-6 animate-slide-up" data-testid={`widget-stat-${widget.id}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-1">{widget.title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function RecentConversationsWidget({ conversations }: { conversations: { _id: string; title: string; updatedAt: string; messages: unknown[] }[] }) {
  return (
    <div className="glass rounded-2xl p-6" data-testid="widget-recent-conversations">
      <h3 className="text-sm font-medium text-slate-400 mb-4">Recent Conversations</h3>
      {!conversations?.length ? (
        <p className="text-slate-600 text-sm">No conversations yet</p>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => (
            <div key={conv._id} className="flex items-center justify-between py-2 border-b border-surface-3 last:border-0">
              <div>
                <p className="text-sm text-white truncate max-w-xs">{conv.title}</p>
                <p className="text-xs text-slate-500">{conv.messages?.length || 0} messages</p>
              </div>
              <span className="text-xs text-slate-500">{new Date(conv.updatedAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AIUsageWidget({ stats }: { stats: Record<string, number | string> }) {
  return (
    <div className="glass rounded-2xl p-6" data-testid="widget-ai-usage">
      <h3 className="text-sm font-medium text-slate-400 mb-4">AI Usage Stats</h3>
      <div className="space-y-3">
        {[
          { label: "Total AI Calls", value: stats?.aiCallsThisMonth },
          { label: "Avg Response Time", value: stats?.avgResponseTime },
          { label: "Active Users", value: stats?.activeUsers },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between items-center">
            <span className="text-sm text-slate-400">{label}</span>
            <span className="text-sm font-medium text-white">{value ?? "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function IntegrationStatusWidget({ instances }: { instances: { integrations: { type: string; enabled: boolean; label: string }[] }[] }) {
  const allIntegrations = instances?.flatMap((inst) => inst.integrations || []) || [];
  return (
    <div className="glass rounded-2xl p-6" data-testid="widget-integration-status">
      <h3 className="text-sm font-medium text-slate-400 mb-4">Connected Integrations</h3>
      {!allIntegrations.length ? (
        <p className="text-slate-600 text-sm">No integrations configured</p>
      ) : (
        <div className="space-y-2">
          {allIntegrations.map((int, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-surface-3 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${int.enabled ? "bg-emerald-400" : "bg-surface-4"}`} />
                <span className="text-sm text-white">{int.label}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${int.enabled ? "bg-emerald-900/30 text-emerald-400" : "bg-surface-3 text-slate-500"}`}>
                {int.enabled ? "Active" : "Disabled"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Widget Router - renders correct component based on MongoDB widget.type ──

function WidgetRenderer({ widget, stats, recentConversations, instances }: {
  widget: IDashboardWidget;
  stats: Record<string, number | string>;
  recentConversations: { _id: string; title: string; updatedAt: string; messages: unknown[] }[];
  instances: { integrations: { type: string; enabled: boolean; label: string }[] }[];
}) {
  if (!widget.visible) return null;

  switch (widget.type) {
    case "stat-card":
      return <StatCard widget={widget} stats={stats} />;
    case "recent-conversations":
      return <RecentConversationsWidget conversations={recentConversations} />;
    case "ai-usage":
      return <AIUsageWidget stats={stats} />;
    case "integration-status":
      return <IntegrationStatusWidget instances={instances} />;
    default:
      return (
        <div className="glass rounded-2xl p-6">
          <p className="text-xs text-slate-500">Unknown widget type: {widget.type}</p>
        </div>
      );
  }
}

// ── Section Renderer ────────────────────────────────────────────────────────

function SectionRenderer({ section, stats, recentConversations, instances }: {
  section: IDashboardSection;
  stats: Record<string, number | string>;
  recentConversations: { _id: string; title: string; updatedAt: string; messages: unknown[] }[];
  instances: { integrations: { type: string; enabled: boolean; label: string }[] }[];
}) {
  if (!section.visible) return null;

  const sortedWidgets = [...section.widgets].sort((a, b) => a.order - b.order);
  const isGrid = sortedWidgets.some((w) => w.type === "stat-card");

  return (
    <div className="mb-8" data-testid={`section-${section.id}`}>
      <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">{section.title}</h2>
      <div className={isGrid ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
        {sortedWidgets.map((widget) => (
          <WidgetRenderer
            key={widget.id}
            widget={widget}
            stats={stats}
            recentConversations={recentConversations}
            instances={instances}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main Admin Dashboard Page ───────────────────────────────────────────────

export default function AdminDashboardPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const { data: projectData } = useProject(slug);
  const { data, isLoading, error } = useDashboard(slug);

  useEffect(() => {
    if (projectData && projectData.role !== "admin") {
      router.push(`/project/${slug}/chat`);
    }
  }, [projectData, slug, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex gap-2">{[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-brand-500 typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />)}</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <p className="text-slate-400">Admin access required</p>
        </div>
      </div>
    );
  }

  const { config, stats, recentConversations, instances } = data;
  const sortedSections = [...(config.sections || [])].sort((a: IDashboardSection, b: IDashboardSection) => a.order - b.order);

  return (
    <div className="h-full overflow-y-auto" data-testid="admin-dashboard">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Config-driven header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white" data-testid="dashboard-header-title">
            {config.headerTitle}
          </h1>
          <p className="text-slate-400 mt-1" data-testid="dashboard-header-subtitle">
            {config.headerSubtitle}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-slate-600">Last updated: {new Date(config.updatedAt).toLocaleString()}</span>
            <span className="text-xs bg-emerald-900/30 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800/30">Config-driven ✓</span>
          </div>
        </div>

        {/* Config-driven sections and widgets */}
        {sortedSections.map((section: IDashboardSection) => (
          <SectionRenderer
            key={section.id}
            section={section}
            stats={stats}
            recentConversations={recentConversations}
            instances={instances}
          />
        ))}

        {/* Config hint */}
        <div className="glass rounded-2xl p-4 mt-4 border border-brand-800/20">
          <p className="text-xs text-slate-500">
            💡 This dashboard layout is driven by the <code className="text-brand-400">dashboardconfigs</code> collection in MongoDB.
            Edit the document for project <code className="text-brand-400">{slug}</code> to change sections, widgets, or labels without any code changes.
          </p>
        </div>
      </div>
    </div>
  );
}
