"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ── Auth ──────────────────────────────────────────────
export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return null;
      return res.json();
    },
    retry: false,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) { 
        try {
          const e = await res.json();
          throw new Error(e.error);
        } catch {
          throw new Error("Login failed. Please check your credentials or try again later.");
        }
      }
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => { await fetch("/api/auth/logout", { method: "POST" }); },
    onSuccess: () => { qc.clear(); window.location.href = "/login"; },
  });
}

// ── Projects ──────────────────────────────────────────
export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
  });
}

export function useProject(slug: string) {
  return useQuery({
    queryKey: ["project", slug],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${slug}`);
      if (!res.ok) throw new Error("Failed to fetch project");
      return res.json();
    },
    enabled: !!slug,
  });
}

// ── Dashboard ─────────────────────────────────────────
export function useDashboard(slug: string) {
  return useQuery({
    queryKey: ["dashboard", slug],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${slug}/dashboard`);
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      return res.json();
    },
    enabled: !!slug,
    refetchInterval: 30000,
  });
}

export function useUpdateDashboard(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch(`/api/projects/${slug}/dashboard`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed to update dashboard");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dashboard", slug] }),
  });
}

// ── Conversations ─────────────────────────────────────
export function useConversations(slug: string) {
  return useQuery({
    queryKey: ["conversations", slug],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${slug}/conversations`);
      if (!res.ok) throw new Error("Failed to fetch conversations");
      return res.json();
    },
    enabled: !!slug,
  });
}

export function useConversation(slug: string, conversationId: string) {
  return useQuery({
    queryKey: ["conversation", slug, conversationId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${slug}/conversations/${conversationId}`);
      if (!res.ok) throw new Error("Failed to fetch conversation");
      return res.json();
    },
    enabled: !!slug && !!conversationId,
  });
}

export function useCreateConversation(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { productInstanceId: string; title?: string }) => {
      const res = await fetch(`/api/projects/${slug}/conversations`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed to create conversation");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conversations", slug] }),
  });
}

export function useSendMessage(slug: string, conversationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/projects/${slug}/conversations/${conversationId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }) });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conversation", slug, conversationId] }),
  });
}
