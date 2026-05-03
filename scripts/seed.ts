import "dotenv/config";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/debales-ai";

// Inline minimal models for seeding
const UserSchema = new mongoose.Schema({ email: String, name: String, passwordHash: String, createdAt: { type: Date, default: Date.now } });
const ProjectSchema = new mongoose.Schema({ name: String, slug: String, description: String, members: [{ userId: mongoose.Schema.Types.ObjectId, role: String }], createdAt: { type: Date, default: Date.now } });
const ProductInstanceSchema = new mongoose.Schema({ projectId: mongoose.Schema.Types.ObjectId, productType: String, nameSpace: String, label: String, integrations: [mongoose.Schema.Types.Mixed], systemPrompt: String, createdAt: { type: Date, default: Date.now } });
const DashboardConfigSchema = new mongoose.Schema({ projectId: mongoose.Schema.Types.ObjectId, headerTitle: String, headerSubtitle: String, sections: mongoose.Schema.Types.Mixed, updatedAt: { type: Date, default: Date.now } });

const User = mongoose.model("User", UserSchema);
const Project = mongoose.model("Project", ProjectSchema);
const ProductInstance = mongoose.model("ProductInstance", ProductInstanceSchema);
const DashboardConfig = mongoose.model("DashboardConfig", DashboardConfigSchema);

async function seed() {
  console.log("🌱 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected!");

  // Clear existing
  await User.deleteMany({});
  await Project.deleteMany({});
  await ProductInstance.deleteMany({});
  await DashboardConfig.deleteMany({});
  console.log("🧹 Cleared existing data");

  // Create users
  const adminAcme = await User.create({ email: "admin@acme.com", name: "Arjun Mehta (Admin)", passwordHash: "password123" });
  const memberAcme = await User.create({ email: "member@acme.com", name: "Priya Singh (Member)", passwordHash: "password123" });
  const adminTech = await User.create({ email: "admin@techstart.com", name: "Rohit Verma (Admin)", passwordHash: "password123" });
  console.log("👥 Created users:", adminAcme.email, memberAcme.email, adminTech.email);

  // Create ACME project
  const acmeProject = await Project.create({
    name: "ACME Corp",
    slug: "acme-corp",
    description: "E-commerce AI assistant for ACME Corporation",
    members: [
      { userId: adminAcme._id, role: "admin" },
      { userId: memberAcme._id, role: "member" },
    ],
  });

  // Create TechStart project
  const techProject = await Project.create({
    name: "TechStart",
    slug: "techstart",
    description: "CRM-focused AI assistant for TechStart",
    members: [{ userId: adminTech._id, role: "admin" }],
  });

  console.log("🏢 Created projects:", acmeProject.slug, techProject.slug);

  // Create product instances for ACME
  await ProductInstance.create({
    projectId: acmeProject._id,
    productType: "ai-sales-assistant",
    nameSpace: "acme-sales",
    label: "ACME AI Sales Assistant",
    systemPrompt: "You are an AI Sales Assistant for ACME Corp, an e-commerce company. Help with sales analysis, order management, customer insights, and growth strategies. Be concise and data-driven.",
    integrations: [
      { type: "shopify", enabled: true, label: "Shopify Store", mockDataKey: "shopify_orders" },
      { type: "crm", enabled: true, label: "HubSpot CRM", mockDataKey: "crm_contacts" },
      { type: "analytics", enabled: false, label: "Google Analytics", mockDataKey: "analytics_data" },
      { type: "email", enabled: false, label: "Mailchimp", mockDataKey: "email_campaigns" },
    ],
  });

  // Create product instance for TechStart
  await ProductInstance.create({
    projectId: techProject._id,
    productType: "ai-crm-assistant",
    nameSpace: "techstart-crm",
    label: "TechStart CRM Assistant",
    systemPrompt: "You are a CRM AI assistant for TechStart. Help with lead management, pipeline analysis, sales forecasting, and customer relationship strategies.",
    integrations: [
      { type: "crm", enabled: true, label: "Salesforce CRM", mockDataKey: "crm_contacts" },
      { type: "email", enabled: true, label: "SendGrid Email", mockDataKey: "email_campaigns" },
      { type: "shopify", enabled: false, label: "Shopify (inactive)", mockDataKey: "shopify_orders" },
    ],
  });

  console.log("🤖 Created product instances");

  // Create dashboard configs
  await DashboardConfig.create({
    projectId: acmeProject._id,
    headerTitle: "ACME Corp Dashboard",
    headerSubtitle: "Real-time AI assistant analytics and business insights",
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
  });

  await DashboardConfig.create({
    projectId: techProject._id,
    headerTitle: "TechStart Analytics Hub",
    headerSubtitle: "CRM pipeline and AI performance metrics",
    sections: [
      {
        id: "kpis",
        title: "Key Performance Indicators",
        order: 1,
        visible: true,
        widgets: [
          { id: "conversations", type: "stat-card", title: "Conversations", order: 1, visible: true, config: { valueKey: "totalConversations", icon: "MessageSquare", color: "brand" } },
          { id: "messages", type: "stat-card", title: "Messages", order: 2, visible: true, config: { valueKey: "totalMessages", icon: "Zap", color: "purple" } },
        ],
      },
      {
        id: "data",
        title: "Data",
        order: 2,
        visible: true,
        widgets: [
          { id: "recent-convs", type: "recent-conversations", title: "Recent Conversations", order: 1, visible: true, config: {} },
          { id: "integration-status", type: "integration-status", title: "Integration Status", order: 2, visible: true, config: {} },
        ],
      },
    ],
    updatedAt: new Date(),
  });

  console.log("📊 Created dashboard configs");
  console.log("\n✅ Seed complete!");
  console.log("\n📋 Login credentials:");
  console.log("  Admin (ACME):     admin@acme.com / password123");
  console.log("  Member (ACME):    member@acme.com / password123");
  console.log("  Admin (TechStart): admin@techstart.com / password123");
  console.log("\n🔑 Config-driven dashboard lives in: dashboardconfigs collection");
  console.log("   Edit the document to change dashboard layout without code changes!");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
