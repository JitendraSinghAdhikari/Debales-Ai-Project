export type UserRole = "admin" | "member";
export type ProductType = "ai-sales-assistant" | "ai-support-assistant" | "ai-crm-assistant";
export type IntegrationType = "shopify" | "crm" | "analytics" | "email";
export type MessageRole = "user" | "assistant";
export type WidgetType = "stat-card" | "chart-bar" | "chart-line" | "list" | "integration-status" | "recent-conversations" | "ai-usage";

export interface IUser {
  _id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
}

export interface IProjectMember {
  userId: string;
  role: UserRole;
}

export interface IProject {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  members: IProjectMember[];
  createdAt: Date;
}

export interface IIntegrationConfig {
  type: IntegrationType;
  enabled: boolean;
  label: string;
  mockDataKey: string;
}

export interface IProductInstance {
  _id: string;
  projectId: string;
  productType: ProductType;
  nameSpace: string;
  label: string;
  integrations: IIntegrationConfig[];
  systemPrompt?: string;
  createdAt: Date;
}

export interface IMessage {
  role: MessageRole;
  content: string;
  steps?: string[];
  createdAt: Date;
}

export interface IConversation {
  _id: string;
  projectId: string;
  productInstanceId: string;
  userId: string;
  title: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// --- Dashboard Config Types ---
export interface IDashboardStat {
  label: string;
  valueKey: string;   // key fetched from stats endpoint
  icon: string;
  color: string;
}

export interface IDashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  order: number;
  visible: boolean;
  config?: Record<string, unknown>;
}

export interface IDashboardSection {
  id: string;
  title: string;
  order: number;
  visible: boolean;
  widgets: IDashboardWidget[];
}

export interface IDashboardConfig {
  _id: string;
  projectId: string;
  headerTitle: string;
  headerSubtitle: string;
  sections: IDashboardSection[];
  updatedAt: Date;
}

// --- Session ---
export interface SessionUser {
  userId: string;
  email: string;
  name: string;
}

export interface ProjectSession {
  projectId: string;
  projectSlug: string;
  role: UserRole;
}
