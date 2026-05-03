import mongoose, { Schema, model, models, Document } from "mongoose";

// ── User ──────────────────────────────────────────────
export interface UserDoc extends Document {
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
}
const UserSchema = new Schema<UserDoc>({
  email: { type: String, required: true, unique: true, lowercase: true },
  name: { type: String, required: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
export const User = models.User || model<UserDoc>("User", UserSchema);

// ── Project ───────────────────────────────────────────
export interface ProjectDoc extends Document {
  name: string;
  slug: string;
  description?: string;
  members: { userId: mongoose.Types.ObjectId; role: "admin" | "member" }[];
  createdAt: Date;
}
const ProjectSchema = new Schema<ProjectDoc>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: String,
  members: [{ userId: { type: Schema.Types.ObjectId, ref: "User" }, role: { type: String, enum: ["admin", "member"], default: "member" } }],
  createdAt: { type: Date, default: Date.now },
});
export const Project = models.Project || model<ProjectDoc>("Project", ProjectSchema);

// ── ProductInstance ───────────────────────────────────
export interface ProductInstanceDoc extends Document {
  projectId: mongoose.Types.ObjectId;
  productType: string;
  nameSpace: string;
  label: string;
  integrations: { type: string; enabled: boolean; label: string; mockDataKey: string }[];
  systemPrompt?: string;
  createdAt: Date;
}
const ProductInstanceSchema = new Schema<ProductInstanceDoc>({
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  productType: { type: String, required: true },
  nameSpace: { type: String, required: true },
  label: { type: String, required: true },
  integrations: [{ type: String, enabled: Boolean, label: String, mockDataKey: String }],
  systemPrompt: String,
  createdAt: { type: Date, default: Date.now },
});
export const ProductInstance = models.ProductInstance || model<ProductInstanceDoc>("ProductInstance", ProductInstanceSchema);

// ── Conversation ──────────────────────────────────────
export interface ConversationDoc extends Document {
  projectId: mongoose.Types.ObjectId;
  productInstanceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  messages: { role: "user" | "assistant"; content: string; steps?: string[]; createdAt: Date }[];
  createdAt: Date;
  updatedAt: Date;
}
const ConversationSchema = new Schema<ConversationDoc>({
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  productInstanceId: { type: Schema.Types.ObjectId, ref: "ProductInstance", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, default: "New Conversation" },
  messages: [{
    role: { type: String, enum: ["user", "assistant"] },
    content: String,
    steps: [String],
    createdAt: { type: Date, default: Date.now },
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
export const Conversation = models.Conversation || model<ConversationDoc>("Conversation", ConversationSchema);

// ── DashboardConfig ───────────────────────────────────
export interface DashboardConfigDoc extends Document {
  projectId: mongoose.Types.ObjectId;
  headerTitle: string;
  headerSubtitle: string;
  sections: {
    id: string;
    title: string;
    order: number;
    visible: boolean;
    widgets: {
      id: string;
      type: string;
      title: string;
      order: number;
      visible: boolean;
      config?: Record<string, unknown>;
    }[];
  }[];
  updatedAt: Date;
}
const DashboardConfigSchema = new Schema<DashboardConfigDoc>({
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, unique: true },
  headerTitle: { type: String, default: "Dashboard" },
  headerSubtitle: { type: String, default: "Project Overview" },
  sections: [{
    id: String,
    title: String,
    order: Number,
    visible: { type: Boolean, default: true },
    widgets: [{
      id: String,
      type: String,
      title: String,
      order: Number,
      visible: { type: Boolean, default: true },
      config: { type: Schema.Types.Mixed, default: {} },
    }],
  }],
  updatedAt: { type: Date, default: Date.now },
});
export const DashboardConfig = models.DashboardConfig || model<DashboardConfigDoc>("DashboardConfig", DashboardConfigSchema);
