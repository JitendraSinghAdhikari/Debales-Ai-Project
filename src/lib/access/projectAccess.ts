import type { IProjectMember, UserRole } from "@/types";

// ── Pure access rule functions ─────────────────────────────────────────────

export function isMemberOfProject(members: IProjectMember[], userId: string): boolean {
  return members.some((m) => m.userId.toString() === userId);
}

export function getRoleInProject(members: IProjectMember[], userId: string): UserRole | null {
  const member = members.find((m) => m.userId.toString() === userId);
  return member?.role ?? null;
}

export function isAdminOfProject(members: IProjectMember[], userId: string): boolean {
  return getRoleInProject(members, userId) === "admin";
}

export function canViewProject(members: IProjectMember[], userId: string): boolean {
  return isMemberOfProject(members, userId);
}

export function canAccessAdminDashboard(members: IProjectMember[], userId: string): boolean {
  return isAdminOfProject(members, userId);
}

export function canManageProjectSettings(members: IProjectMember[], userId: string): boolean {
  return isAdminOfProject(members, userId);
}
