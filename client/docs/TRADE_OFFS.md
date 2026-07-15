# Trade-Offs & Design Decisions

## 1. localStorage vs. PostgreSQL

| Aspect             | localStorage (chosen)                    | PostgreSQL (ideal)                     |
|--------------------|------------------------------------------|----------------------------------------|
| **Setup**          | Zero config, works immediately           | Requires writable DB + migration       |
| **Multi-user**     | Per-browser only                         | True multi-user, real-time sync        |
| **Data durability**| Lost on cache clear                      | Persistent, backed up                  |
| **Scalability**    | ~5–10 MB limit                           | Virtually unlimited                    |
| **Concurrency**    | No conflict resolution                   | ACID transactions                      |

**Why localStorage?** The only available PostgreSQL integration (`[Demo] Orders`) runs as `demo_user` on `superblocks_wayfair_demo` with no `CREATE` privilege on the `public` schema. Rather than blocking the entire project, we built the full feature set on localStorage with a clean migration path to a real database.

**Migration path:** Replace `tracker-store.ts` functions with server API calls. The function signatures were designed to match API contracts 1:1 — no frontend changes needed.

---

## 2. Platform Auth vs. Custom Auth

| Aspect                | Platform Auth (chosen)                  | Custom Auth                            |
|-----------------------|-----------------------------------------|----------------------------------------|
| **Implementation**    | `useSuperblocksUser()` — 1 line         | Login form + JWT + bcrypt + sessions   |
| **Security**          | Superblocks SSO, enterprise-grade       | Self-managed, higher risk              |
| **User management**   | Handled by Superblocks admin            | Custom registration flow needed        |
| **Flexibility**       | Tied to Superblocks users               | Arbitrary users, public signup         |

**Why platform auth?** Superblocks already authenticates users via SSO. Re-implementing authentication would add complexity with no security benefit inside the Superblocks runtime. The `ctx.user` object on the server side provides tamper-proof identity.

---

## 3. Drag-and-Drop Library: @dnd-kit

| Option        | Pros                                      | Cons                                |
|---------------|-------------------------------------------|-------------------------------------|
| **@dnd-kit**  | Lightweight, accessible, React-first, composable | Smaller ecosystem than alternatives |
| react-beautiful-dnd | Battle-tested, popular          | Deprecated/unmaintained, heavier    |
| react-dnd     | Flexible, backend-agnostic               | Complex API, more boilerplate       |

**Why @dnd-kit?** It's actively maintained, has first-class React 18 support, built-in accessibility (keyboard + screen reader), and its composable architecture (`@dnd-kit/core` + `@dnd-kit/sortable`) keeps the bundle small.

---

## 4. AI Model: Claude Sonnet 4 (claude-sonnet-4-6)

| Option                | Pros                              | Cons                                  |
|-----------------------|-----------------------------------|---------------------------------------|
| **Claude Sonnet 4**   | Fast, cost-effective, high quality | Requires Anthropic integration        |
| Claude Opus           | Highest quality                   | Slower, more expensive, overkill      |
| GPT-4                 | Widely known                      | Requires separate OpenAI integration  |

**Why Sonnet 4?** It provides excellent task description generation at lower cost and latency than Opus. The Anthropic integration was already configured in the workspace. Model identifier: `claude-sonnet-4-6`.

---

## 5. Client-Side Store Pattern

The `tracker-store.ts` module uses a **functional store pattern** — pure functions that read/write a shared localStorage state. This was chosen over:

- **React Context + useReducer**: Would require prop drilling or context nesting for deeply nested components.
- **Zustand / Redux**: External state management libraries add bundle weight and complexity for what is fundamentally a CRUD data layer.
- **Direct API calls everywhere**: Would scatter data access logic across components.

The functional store centralizes all data access, making it trivial to swap localStorage for API calls later.

---

## 6. RBAC: Client-Side Enforcement

| Approach              | Pros                              | Cons                                  |
|-----------------------|-----------------------------------|---------------------------------------|
| **Client-side only**  | Simple, immediate UX feedback     | Bypassable by tech-savvy users        |
| Server-side only      | Tamper-proof                      | Poor UX (actions fail after click)    |
| Both (ideal)          | Best security + UX                | More code to maintain                 |

**Current state:** Client-side enforcement in the store layer + UI gating. This is acceptable for localStorage-backed data (the data is already client-side). When migrating to PostgreSQL, server-side enforcement via `ctx.user` in APIs + PostgreSQL RLS policies should be added.

---

## 7. Test Scaffold

The test file (`client/__tests__/tracker-store.test.ts`) uses `@ts-nocheck` and `describe`/`it`/`expect` syntax compatible with both Jest and Vitest. It is a **scaffold** — tests are structured but not wired to a runner in the Superblocks environment. To run them:

1. Install Vitest: `npm install -D vitest`
2. Add `jsdom` environment for localStorage mocking
3. Remove `@ts-nocheck` and fix any type issues
4. Run: `npx vitest`

---

## 8. Component Decomposition

The app follows strict component decomposition:

- **Pages** orchestrate layout and data flow (Dashboard, Projects, ProjectDetail, Members)
- **Components** handle rendering and interaction (KanbanBoard, TaskCard, TaskDialog, StatCard, etc.)
- **No monolithic files** — largest component is ~200 lines

This makes the codebase maintainable and each piece independently testable.

---

## Summary

| Decision                  | Chosen                   | Reason                                    |
|---------------------------|--------------------------|-------------------------------------------|
| Data persistence          | localStorage             | No writable DB available                  |
| Authentication            | Superblocks platform     | Already authenticated, secure             |
| Drag-and-drop             | @dnd-kit                 | Modern, accessible, lightweight           |
| AI model                  | Claude Sonnet 4          | Fast, cost-effective, already integrated   |
| State management          | Functional store module  | Simple, portable, easy to migrate          |
| RBAC enforcement          | Client-side store + UI   | Appropriate for localStorage architecture |
| Testing                   | Scaffold (Jest/Vitest)   | No test runner in Superblocks runtime      |
