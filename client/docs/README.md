# Task & Project Tracker — Architecture Guide

## Overview

A full-featured Task & Project Tracker built on the Superblocks platform with:
- Organization management with role-based access control
- Project CRUD with Kanban boards (drag-and-drop)
- AI-powered task description generation (Anthropic Claude Sonnet)
- Dashboard with task metrics and upcoming due dates
- localStorage persistence (read-only demo database constraint)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Tailwind CSS v4 |
| UI Components | Superblocks component library (shadcn-based) |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Routing | react-router v7 (data mode) |
| State | React Context + localStorage |
| AI | Anthropic Claude Sonnet 4-6 via Superblocks SDK |
| Auth | Superblocks platform SSO (useSuperblocksUser) |

## Folder Structure

```
├── client/
│   ├── App.tsx                          # Root layout: sidebar + page outlet
│   ├── router.tsx                       # All route definitions
│   ├── index.css                        # Tailwind v4 theme tokens
│   │
│   ├── context/
│   │   └── AuthContext.tsx              # Auth state from platform user + org management
│   │
│   ├── store/
│   │   └── tracker-store.ts            # ALL data logic — CRUD, RBAC, dashboard aggregation
│   │                                    # Single source of truth, localStorage-backed
│   │
│   ├── types/
│   │   └── tracker.ts                  # Shared types, permission helpers, display constants
│   │
│   ├── pages/
│   │   ├── Dashboard/index.tsx         # Stat cards + upcoming due dates
│   │   ├── Projects/index.tsx          # Project grid + create dialog
│   │   ├── ProjectDetail/index.tsx     # Kanban board with drag-and-drop
│   │   └── Members/index.tsx           # Member table + invite dialog
│   │
│   ├── components/
│   │   ├── kanban/
│   │   │   ├── KanbanBoard.tsx         # DndContext wrapper + 3 columns
│   │   │   ├── KanbanColumn.tsx        # Droppable status column
│   │   │   ├── TaskCard.tsx            # Draggable task card (useSortable)
│   │   │   └── TaskDialog.tsx          # Create/edit task form + AI generate button
│   │   ├── dashboard/
│   │   │   ├── StatCard.tsx            # Single metric card
│   │   │   └── UpcomingTaskRow.tsx     # Due-date list item
│   │   ├── projects/
│   │   │   └── ProjectCard.tsx         # Project grid card with task count
│   │   ├── orgs/
│   │   │   └── CreateOrgPrompt.tsx     # Empty-state org creation flow
│   │   └── layout/
│   │       ├── AppSidebar.tsx          # Navigation + org switcher + user info
│   │       ├── EmptyState.tsx          # Reusable empty state component
│   │       └── ErrorBanner.tsx         # Reusable error display
│   │
│   └── __tests__/
│       └── tracker-store.test.ts       # Unit test scaffold (portable to Jest/Vitest)
│
├── server/
│   └── apis/
│       ├── index.ts                    # API registry (GenerateTaskDescription only)
│       └── ai/
│           └── generate-description.ts # Claude Sonnet API for task descriptions
│
└── docs/                               # ← You are here
    ├── README.md                        # This file
    ├── DATABASE_SCHEMA.md               # Full SQL schema + ER description
    ├── RBAC.md                          # Role-based access control spec
    └── TRADE_OFFS.md                    # Assumptions and trade-offs
```

## Key Design Decisions

1. **Separation of concerns**: All data logic lives in `tracker-store.ts` — pages and components never manipulate state directly, they call store functions.

2. **RBAC in one place**: Permission checks (`canManageMembers`, `canDeleteProject`, `canManageRoles`) are defined once in `types/tracker.ts` and used everywhere.

3. **Auth via platform**: Instead of custom login, we use `useSuperblocksUser()` which provides the logged-in user's name, email, and ID from the Superblocks SSO session.

4. **Only AI is server-side**: The `GenerateTaskDescription` API is the only server API because it requires the Anthropic integration. Everything else runs client-side.

## Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | — | Redirects to `/dashboard` |
| `/dashboard` | Dashboard | Status counts, upcoming tasks, org overview |
| `/projects` | Projects | Grid of project cards, create dialog |
| `/projects/:projectId` | ProjectDetail | Kanban board with 3 status columns |
| `/members` | Members | Member table with invite functionality |
