// ── Shared frontend types ─────────────────────────────────

export type OrgRole = "admin" | "manager" | "member";
export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface TrackerUser {
  id: string;
  email: string;
  display_name: string;
}

export interface Organization {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
}

export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  email: string;
  display_name: string;
  role: OrgRole;
  created_at: string;
}

export interface Project {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  created_at: string;
  created_by: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  assignee_id: string | null;
  assignee_name: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface UpcomingTask extends Task {
  project_name?: string;
}

// ── Permission helpers ────────────────────────────────────

export function canManageMembers(role: OrgRole): boolean {
  return role === "admin" || role === "manager";
}

export function canDeleteProject(role: OrgRole): boolean {
  return role === "admin" || role === "manager";
}

export function canManageRoles(role: OrgRole): boolean {
  return role === "admin";
}

// ── Display helpers ───────────────────────────────────────

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};
