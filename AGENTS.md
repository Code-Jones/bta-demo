
## `AGENTS.md`
```md
# Agents Guide — BTA Demo

This project is built to be iterated quickly with AI assistance while keeping code quality “real job” level.
Agents should optimize for:
- correctness
- clarity
- end-to-end demo value
- minimal complexity

## North Star
Deliver a web demo that feels like a contractor ops dashboard:
**Pipeline + Scoreboard + Traceable transitions**.

Avoid over-engineering. No microservices. No premature abstractions.

## Architecture Rules

### Backend (.NET 10)
- Controllers are thin (HTTP concerns only).
- Business rules live in Application services (or entity methods for state transitions).
- EF Core entities are not returned directly to the UI; use DTOs for responses.
- Prefer explicit state transitions:
  - `SendEstimate`, `AcceptEstimate`, `MarkInvoicePaid`, etc.
- Any multi-step transition should be transactional.

Exception mapping:
- invalid state transition → 409 Conflict
- missing resource → 404
- invalid request → 400

### Frontend (React)
- TanStack Router with file-based routing in `src/routes/`.
- Data fetching via TanStack Query only (no ad-hoc fetch inside components).
- Keep query keys consistent and centralized.
- Tailwind + DaisyUI for rapid, consistent UI components.

## Conventions

### Naming
- Backend: `PascalCase` types, `camelCase` locals.
- Frontend: `PascalCase` components, `camelCase` hooks/functions.
- Routes: file-based, use clear route segments:
  - `/dashboard`
  - `/pipeline`
  - `/leads`
  - `/leads/$leadId`
  - `/estimates`
  - `/jobs`
  - `/invoices`
  - `/automation-log`

### Data model assumptions
Minimal entities:
- Lead
- Estimate (status + timestamps)
- Job (status + scheduled date)
- Invoice (status + amount)
Optional soon:
- Activity timeline entries
- Automation/outbox events

### UX rules
- Every page must have:
  - loading state
  - error state
  - empty state
- Prefer tables + filters over fancy drag/drop early.
- “Scoreboard” must stay readable at a glance.

## Task Priorities (in order)

1. Backend endpoints for pipeline transitions + scoreboard
2. Frontend pages + routing scaffold
3. Hook up React Query to real endpoints
4. Pipeline view + detail pages
5. Add Activity timeline (simple)
6. Add Automation Log (even if stubbed)
7. (Stretch) Outbox worker + automation rules

## Definition of Done
A feature is “done” when:
- API endpoint exists + is documented in Swagger
- Frontend page consumes it via React Query
- UI has loading/error/empty states
- The demo flow works end-to-end without manual DB edits

## Agent Output Requirements
When adding code, always include:
- file paths
- exact commands to run
- any migrations required
- any query key invalidations needed

Avoid:
- complex auth
- multi-tenant design
- background job frameworks
- event buses

If there’s a choice: pick the simplest thing that still looks professional.
