# Role-Based Access Control (RBAC)

## Overview

The app enforces three organization-level roles: **Admin**, **Manager**, and **Member**. Permissions cascade downward — an Admin can do everything a Manager and Member can do.

---

## Roles

| Role       | Description                                                         |
|------------|---------------------------------------------------------------------|
| **Admin**  | Full control. Can manage members, roles, projects, and all tasks.   |
| **Manager**| Can create/delete projects and manage all tasks within them.        |
| **Member** | Can create tasks and edit/move their own tasks.                     |

---

## Permissions Matrix

| Action                    | Admin | Manager | Member |
|---------------------------|:-----:|:-------:|:------:|
| Create organization       | ✅    | ✅      | ✅     |
| View organization         | ✅    | ✅      | ✅     |
| Invite members            | ✅    | ✅      | ❌     |
| Change member roles       | ✅    | ❌      | ❌     |
| Remove members            | ✅    | ✅      | ❌     |
| Create project            | ✅    | ✅      | ❌     |
| Delete project            | ✅    | ❌      | ❌     |
| View project / tasks      | ✅    | ✅      | ✅     |
| Create task               | ✅    | ✅      | ✅     |
| Edit any task             | ✅    | ✅      | ❌     |
| Edit own task             | ✅    | ✅      | ✅     |
| Move task (drag & drop)   | ✅    | ✅      | ✅     |
| Delete any task           | ✅    | ✅      | ❌     |
| Delete own task           | ✅    | ✅      | ✅     |

> **Note:** The organization creator is automatically assigned the `admin` role.

---

## Permission Helper Functions

Defined in `client/types/tracker.ts`:

```typescript
// Can invite/remove members (admin + manager)
export function canManageMembers(role: OrgRole): boolean {
  return role === 'admin' || role === 'manager';
}

// Can delete projects (admin only)
export function canDeleteProject(role: OrgRole): boolean {
  return role === 'admin';
}

// Can change member roles (admin only)
export function canManageRoles(role: OrgRole): boolean {
  return role === 'admin';
}
```

---

## Enforcement Points

### 1. UI Layer (Component-Level Gating)

Buttons and actions are conditionally rendered based on the user's role:

| Component               | Gated Element                          | Check                  |
|--------------------------|---------------------------------------|------------------------|
| `Members/index.tsx`      | "Invite Member" button                | `canManageMembers()`   |
| `Members/index.tsx`      | Role change dropdown                  | `canManageRoles()`     |
| `Projects/index.tsx`     | "New Project" button                  | `canManageMembers()`   |
| `ProjectCard.tsx`        | Delete project button                 | `canDeleteProject()`   |
| `TaskDialog.tsx`         | Edit fields (non-owner tasks)         | role ≥ manager         |

### 2. Store Layer (Data-Level Enforcement)

The `tracker-store.ts` functions validate permissions before mutating data:

```typescript
// Example: createProject checks the caller has admin or manager role
export function createProject(orgId: string, userId: string, ...): Project | null {
  const role = getUserRole(orgId, userId);
  if (!role || !canManageMembers(role)) return null;
  // ... create project
}
```

### 3. Organization Membership Check

Every data-access function first verifies the user is a member of the target organization via `getUserRole()`. Non-members receive `null` / empty results.

---

## Role Assignment Flow

1. **Organization creation** → Creator gets `admin` role automatically.
2. **Member invitation** → Inviter picks a role (`admin`, `manager`, or `member`).
3. **Role changes** → Only `admin` can change another member's role.

---

## Migration Considerations

When moving to a server-side database:

- Move permission checks into **server APIs** using `ctx.user` for the authenticated user ID.
- Keep the same helper functions — they are pure and portable.
- Add row-level security (RLS) policies in PostgreSQL as a defense-in-depth measure.
- The UI gating should remain as a UX enhancement (hiding unavailable actions), but **never as the sole enforcement layer**.
