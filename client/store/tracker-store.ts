/**
 * Client-side data store with localStorage persistence.
 * All CRUD operations happen in-memory with auto-save to localStorage.
 * This replaces the server-side DB layer since the Demo database is read-only.
 */

import type {
  Organization,
  OrgMember,
  OrgRole,
  Project,
  Task,
  TaskStatus,
  TaskPriority,
} from "@/types/tracker.js";

const STORAGE_KEY = "tracker_data_v1";

interface StoreState {
  organizations: Organization[];
  orgMembers: OrgMember[];
  projects: Project[];
  tasks: Task[];
}

function generateId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

function loadState(): StoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as StoreState;
  } catch {
    // Corrupted data — start fresh
  }
  return { organizations: [], orgMembers: [], projects: [], tasks: [] };
}

function saveState(state: StoreState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable — silently fail
  }
}

let state = loadState();

function persist(): void {
  saveState(state);
}

// ── Organizations ────────────────────────────────

export function getOrganizations(userId: string): Organization[] {
  const memberOrgIds = state.orgMembers
    .filter((m) => m.user_id === userId)
    .map((m) => m.org_id);
  return state.organizations.filter((o) => memberOrgIds.includes(o.id));
}

export function createOrganization(userId: string, userName: string, userEmail: string, name: string): Organization {
  if (!name.trim()) throw new Error("Organization name is required.");
  const org: Organization = {
    id: generateId(),
    name: name.trim(),
    created_at: now(),
    created_by: userId,
  };
  const member: OrgMember = {
    id: generateId(),
    org_id: org.id,
    user_id: userId,
    role: "admin",
    display_name: userName,
    email: userEmail,
    created_at: now(),
  };
  state.organizations.push(org);
  state.orgMembers.push(member);
  persist();
  return org;
}

// ── Org Members ──────────────────────────────────

export function getOrgMembers(orgId: string): OrgMember[] {
  return state.orgMembers.filter((m) => m.org_id === orgId);
}

export function getUserRole(orgId: string, userId: string): OrgRole | null {
  const member = state.orgMembers.find(
    (m) => m.org_id === orgId && m.user_id === userId
  );
  return member?.role ?? null;
}

export function inviteMember(
  orgId: string,
  inviterId: string,
  inviteeEmail: string,
  inviteeName: string,
  role: OrgRole
): OrgMember {
  const inviterRole = getUserRole(orgId, inviterId);
  if (!inviterRole || inviterRole === "member") {
    throw new Error("Only admins and managers can invite members.");
  }
  if (role === "admin" && inviterRole !== "admin") {
    throw new Error("Only admins can invite other admins.");
  }
  const existing = state.orgMembers.find(
    (m) => m.org_id === orgId && m.email === inviteeEmail
  );
  if (existing) throw new Error("This user is already a member.");

  const member: OrgMember = {
    id: generateId(),
    org_id: orgId,
    user_id: generateId(), // Simulated user ID for invited member
    role,
    display_name: inviteeName || inviteeEmail.split("@")[0],
    email: inviteeEmail,
    created_at: now(),
  };
  state.orgMembers.push(member);
  persist();
  return member;
}

// ── Projects ─────────────────────────────────────

export function getProjects(orgId: string): Project[] {
  return state.projects
    .filter((p) => p.org_id === orgId)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
}

export function createProject(
  orgId: string,
  userId: string,
  name: string,
  description: string | null
): Project {
  if (!name.trim()) throw new Error("Project name is required.");
  const project: Project = {
    id: generateId(),
    org_id: orgId,
    name: name.trim(),
    description: description?.trim() || null,
    created_at: now(),
    created_by: userId,
  };
  state.projects.push(project);
  persist();
  return project;
}

export function deleteProject(
  projectId: string,
  orgId: string,
  userId: string
): void {
  const role = getUserRole(orgId, userId);
  if (!role || role === "member") {
    throw new Error("Only admins and managers can delete projects.");
  }
  state.projects = state.projects.filter((p) => p.id !== projectId);
  // Cascade delete tasks
  state.tasks = state.tasks.filter((t) => t.project_id !== projectId);
  persist();
}

// ── Tasks ────────────────────────────────────────

export function getTasks(projectId: string): Task[] {
  return state.tasks
    .filter((t) => t.project_id === projectId)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
}

export function createTask(params: {
  projectId: string;
  userId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  assigneeId: string | null;
}): Task {
  if (!params.title.trim()) throw new Error("Task title is required.");
  const assignee = params.assigneeId
    ? state.orgMembers.find((m) => m.user_id === params.assigneeId)
    : null;
  const task: Task = {
    id: generateId(),
    project_id: params.projectId,
    title: params.title.trim(),
    description: params.description?.trim() || null,
    status: params.status,
    priority: params.priority,
    due_date: params.dueDate || null,
    assignee_id: params.assigneeId || null,
    assignee_name: assignee?.display_name ?? null,
    created_by: params.userId,
    created_at: now(),
    updated_at: now(),
  };
  state.tasks.push(task);
  persist();
  return task;
}

export function updateTask(params: {
  taskId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  assigneeId: string | null;
}): Task {
  const task = state.tasks.find((t) => t.id === params.taskId);
  if (!task) throw new Error("Task not found.");
  const assignee = params.assigneeId
    ? state.orgMembers.find((m) => m.user_id === params.assigneeId)
    : null;
  task.title = params.title.trim();
  task.description = params.description?.trim() || null;
  task.status = params.status;
  task.priority = params.priority;
  task.due_date = params.dueDate || null;
  task.assignee_id = params.assigneeId || null;
  task.assignee_name = assignee?.display_name ?? null;
  task.updated_at = now();
  persist();
  return task;
}

export function updateTaskStatus(taskId: string, status: TaskStatus): Task {
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task) throw new Error("Task not found.");
  task.status = status;
  task.updated_at = now();
  persist();
  return task;
}

export function deleteTask(taskId: string): void {
  state.tasks = state.tasks.filter((t) => t.id !== taskId);
  persist();
}

// ── Dashboard ────────────────────────────────────

export interface DashboardData {
  statusCounts: { status: TaskStatus; count: number }[];
  upcomingTasks: Task[];
  totalProjects: number;
  totalMembers: number;
}

export function getDashboard(orgId: string): DashboardData {
  const orgProjects = state.projects.filter((p) => p.org_id === orgId);
  const projectIds = orgProjects.map((p) => p.id);
  const orgTasks = state.tasks.filter((t) => projectIds.includes(t.project_id));

  const statusCounts: { status: TaskStatus; count: number }[] = [
    { status: "todo", count: orgTasks.filter((t) => t.status === "todo").length },
    { status: "in_progress", count: orgTasks.filter((t) => t.status === "in_progress").length },
    { status: "done", count: orgTasks.filter((t) => t.status === "done").length },
  ];

  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingTasks = orgTasks
    .filter((t) => {
      if (!t.due_date || t.status === "done") return false;
      const d = new Date(t.due_date);
      return d >= today && d <= sevenDaysFromNow;
    })
    .sort(
      (a, b) =>
        new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime()
    )
    .slice(0, 10);

  return {
    statusCounts,
    upcomingTasks,
    totalProjects: orgProjects.length,
    totalMembers: state.orgMembers.filter((m) => m.org_id === orgId).length,
  };
}

/** Reset all data — useful for testing */
export function resetStore(): void {
  state = { organizations: [], orgMembers: [], projects: [], tasks: [] };
  persist();
}
