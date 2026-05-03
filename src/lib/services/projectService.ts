import { dbConnect } from "@/lib/db/connect";
import { Project, User, ProductInstance, DashboardConfig } from "@/lib/db/models";
import { canViewProject, canAccessAdminDashboard } from "@/lib/access/projectAccess";

export async function getUserProjects(userId: string) {
  await dbConnect();
  const projects = await Project.find({ "members.userId": userId }).lean();
  return projects;
}

export async function getProjectBySlug(slug: string, userId: string) {
  await dbConnect();
  const project = await Project.findOne({ slug }).lean();
  if (!project) return null;

  const members = project.members.map((m: { userId: { toString(): string }; role: string }) => ({
    userId: m.userId.toString(),
    role: m.role as "admin" | "member",
  }));

  if (!canViewProject(members, userId)) return null;
  return project;
}

export async function getProductInstances(projectId: string) {
  await dbConnect();
  return ProductInstance.find({ projectId }).lean();
}

export async function getDashboardConfig(projectId: string, userId: string) {
  await dbConnect();
  const project = await Project.findById(projectId).lean();
  if (!project) return null;

  const members = project.members.map((m: { userId: { toString(): string }; role: string }) => ({
    userId: m.userId.toString(),
    role: m.role as "admin" | "member",
  }));

  if (!canAccessAdminDashboard(members, userId)) return null;

  let config = await DashboardConfig.findOne({ projectId }).lean();
  if (!config) {
    config = await DashboardConfig.create(getDefaultDashboardConfig(projectId));
  }
  return config;
}

export async function updateDashboardConfig(projectId: string, userId: string, update: Record<string, unknown>) {
  await dbConnect();
  const project = await Project.findById(projectId).lean();
  if (!project) return null;

  const members = project.members.map((m: { userId: { toString(): string }; role: string }) => ({
    userId: m.userId.toString(),
    role: m.role as "admin" | "member",
  }));

  if (!canAccessAdminDashboard(members, userId)) return null;

  return DashboardConfig.findOneAndUpdate(
    { projectId },
    { ...update, updatedAt: new Date() },
    { new: true, upsert: true }
  ).lean();
}

export async function getProjectStats(projectId: string) {
  await dbConnect();
  const { Conversation } = await import("@/lib/db/models");
  const totalConversations = await Conversation.countDocuments({ projectId });
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayConversations = await Conversation.countDocuments({ projectId, createdAt: { $gte: today } });
  const allConvs = await Conversation.find({ projectId }).select("messages").lean();
  const totalMessages = allConvs.reduce((acc: number, c: { messages: unknown[] }) => acc + c.messages.length, 0);

  return {
    totalConversations,
    todayConversations,
    totalMessages,
    activeUsers: 3,
    aiCallsThisMonth: totalMessages,
    avgResponseTime: "1.2s",
  };
}

function getDefaultDashboardConfig(projectId: string) {
  return {
    projectId,
    headerTitle: "Project Dashboard",
    headerSubtitle: "Monitor your AI assistant performance",
    sections: [
      {
        id: "overview",
        title: "Overview",
        order: 1,
        visible: true,
        widgets: [
          { id: "total-conversations", type: "stat-card", title: "Total Conversations", order: 1, visible: true, config: { valueKey: "totalConversations", icon: "MessageSquare", color: "brand" } },
          { id: "today-conversations", type: "stat-card", title: "Today's Chats", order: 2, visible: true, config: { valueKey: "todayConversations", icon: "TrendingUp", color: "green" } },
          { id: "total-messages", type: "stat-card", title: "Total Messages", order: 3, visible: true, config: { valueKey: "totalMessages", icon: "Zap", color: "purple" } },
          { id: "active-users", type: "stat-card", title: "Active Users", order: 4, visible: true, config: { valueKey: "activeUsers", icon: "Users", color: "orange" } },
        ],
      },
      {
        id: "activity",
        title: "Activity",
        order: 2,
        visible: true,
        widgets: [
          { id: "recent-convs", type: "recent-conversations", title: "Recent Conversations", order: 1, visible: true, config: {} },
          { id: "ai-usage", type: "ai-usage", title: "AI Usage Stats", order: 2, visible: true, config: {} },
        ],
      },
      {
        id: "integrations",
        title: "Integration Status",
        order: 3,
        visible: true,
        widgets: [
          { id: "integration-status", type: "integration-status", title: "Connected Integrations", order: 1, visible: true, config: {} },
        ],
      },
    ],
    updatedAt: new Date(),
  };
}
