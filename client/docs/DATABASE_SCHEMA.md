# Database Schema

## Overview

The Task & Project Tracker uses **localStorage** for persistence (key: `tracker_data_v1`) because the available PostgreSQL integration (`[Demo] Orders`) runs as `demo_user` with no `CREATE` privilege on the `public` schema.

Below is the **intended SQL DDL** — the schema the app would use if a writable database were available. The localStorage data structure mirrors these tables exactly.

---

## Entity-Relationship Diagram

```
┌─────────────────────┐
│  organizations      │
│─────────────────────│
│  id (PK)            │
│  name               │
│  created_at         │
│  created_by         │
└────────┬────────────┘
         │ 1
         │
    ┌────┴────┐
    │         │
    ▼ *       ▼ *
┌──────────────┐   ┌──────────────┐
│  org_members │   │   projects   │
│──────────────│   │──────────────│
│  id (PK)     │   │  id (PK)     │
│  org_id (FK) │   │  org_id (FK) │
│  user_id     │   │  name        │
│  email       │   │  description │
│  display_name│   │  created_at  │
│  role        │   │  created_by  │
│  created_at  │   └──────┬───────┘
└──────────────┘          │ 1
                          │
                          ▼ *
                   ┌──────────────┐
                   │    tasks     │
                   │──────────────│
                   │  id (PK)     │
                   │  project_id  │
                   │  title       │
                   │  description │
                   │  status      │
                   │  priority    │
                   │  due_date    │
                   │  assignee_id │
                   │ assignee_name│
                   │  created_by  │
                   │  created_at  │
                   │  updated_at  │
                   └──────────────┘
```

---

## SQL DDL

### Organizations

```sql
CREATE TABLE tracker_organizations (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255)  NOT NULL,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  created_by    UUID          NOT NULL  -- Superblocks user ID of the creator
);

CREATE INDEX idx_orgs_created_by ON tracker_organizations(created_by);
```

### Organization Members

```sql
CREATE TABLE tracker_org_members (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID          NOT NULL REFERENCES tracker_organizations(id) ON DELETE CASCADE,
  user_id       UUID          NOT NULL,
  email         VARCHAR(255)  NOT NULL,
  display_name  VARCHAR(255)  NOT NULL,
  role          VARCHAR(20)   NOT NULL CHECK (role IN ('admin', 'manager', 'member')),
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  UNIQUE(org_id, user_id)
);

CREATE INDEX idx_members_org   ON tracker_org_members(org_id);
CREATE INDEX idx_members_user  ON tracker_org_members(user_id);
```

### Projects

```sql
CREATE TABLE tracker_projects (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID          NOT NULL REFERENCES tracker_organizations(id) ON DELETE CASCADE,
  name          VARCHAR(255)  NOT NULL,
  description   TEXT,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  created_by    UUID          NOT NULL
);

CREATE INDEX idx_projects_org ON tracker_projects(org_id);
```

### Tasks

```sql
CREATE TABLE tracker_tasks (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID          NOT NULL REFERENCES tracker_projects(id) ON DELETE CASCADE,
  title           VARCHAR(500)  NOT NULL,
  description     TEXT,
  status          VARCHAR(20)   NOT NULL CHECK (status IN ('todo', 'in_progress', 'done')),
  priority        VARCHAR(20)   NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date        DATE,
  assignee_id     UUID,
  assignee_name   VARCHAR(255),
  created_by      UUID          NOT NULL,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_tasks_project  ON tracker_tasks(project_id);
CREATE INDEX idx_tasks_status   ON tracker_tasks(status);
CREATE INDEX idx_tasks_assignee ON tracker_tasks(assignee_id);
CREATE INDEX idx_tasks_due      ON tracker_tasks(due_date);
```

---

## localStorage Representation

All data is stored under the key `tracker_data_v1` as a JSON object:

```jsonc
{
  "organizations": [
    {
      "id": "uuid-string",
      "name": "Acme Corp",
      "createdAt": "2026-07-15T10:00:00.000Z",
      "createdBy": "superblocks-user-id"
    }
  ],
  "members": [
    {
      "id": "uuid-string",
      "orgId": "org-uuid",
      "userId": "superblocks-user-id",
      "email": "user@example.com",
      "displayName": "Jane Doe",
      "role": "admin",          // "admin" | "manager" | "member"
      "createdAt": "2026-07-15T10:00:00.000Z"
    }
  ],
  "projects": [
    {
      "id": "uuid-string",
      "orgId": "org-uuid",
      "name": "Website Redesign",
      "description": "Redesign the company website",
      "createdAt": "2026-07-15T10:00:00.000Z",
      "createdBy": "superblocks-user-id"
    }
  ],
  "tasks": [
    {
      "id": "uuid-string",
      "projectId": "project-uuid",
      "title": "Create wireframes",
      "description": "Design wireframes for the homepage",
      "status": "todo",         // "todo" | "in_progress" | "done"
      "priority": "high",       // "low" | "medium" | "high" | "urgent"
      "dueDate": "2026-07-20",  // ISO date string or null
      "assigneeId": "user-uuid" ,
      "assigneeName": "Jane Doe",
      "createdBy": "superblocks-user-id",
      "createdAt": "2026-07-15T10:00:00.000Z",
      "updatedAt": "2026-07-15T10:00:00.000Z"
    }
  ]
}
```

---

## Migration Path (localStorage → PostgreSQL)

To migrate to a real database:

1. **Create the tables** using the DDL above on a writable PostgreSQL instance.
2. **Replace `tracker-store.ts`** functions with server API calls (the function signatures are designed to match API contracts 1:1).
3. **Seed existing data** by reading `localStorage.getItem('tracker_data_v1')` and inserting into the tables.
4. **Remove localStorage calls** from the client.

No frontend components need to change — the store functions are the only abstraction layer between UI and data.
