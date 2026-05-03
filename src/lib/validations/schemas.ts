import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const SendMessageSchema = z.object({
  content: z.string().min(1).max(4000),
  conversationId: z.string().optional(),
});

export const CreateConversationSchema = z.object({
  productInstanceId: z.string().min(1),
  title: z.string().optional(),
});

export const UpdateDashboardConfigSchema = z.object({
  headerTitle: z.string().optional(),
  headerSubtitle: z.string().optional(),
  sections: z.array(z.object({
    id: z.string(),
    title: z.string(),
    order: z.number(),
    visible: z.boolean(),
    widgets: z.array(z.object({
      id: z.string(),
      type: z.string(),
      title: z.string(),
      order: z.number(),
      visible: z.boolean(),
      config: z.record(z.unknown()).optional(),
    })),
  })).optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type SendMessageInput = z.infer<typeof SendMessageSchema>;
export type CreateConversationInput = z.infer<typeof CreateConversationSchema>;
export type UpdateDashboardConfigInput = z.infer<typeof UpdateDashboardConfigSchema>;
