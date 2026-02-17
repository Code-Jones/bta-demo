## `README.md`

```md
# BTA Demo — Contractor Pipeline + Scoreboard

A web-only demo app inspired by Breakthrough Academy’s world: trade/contractor businesses that need a clear **lead → estimate → job → invoice** pipeline and a simple **business scoreboard**.

## Tech Stack

### Backend
- .NET 10 (ASP.NET Core Web API)
- EF Core + PostgreSQL

### Frontend
- React + TypeScript
- TanStack Router (file-based routing)
- TanStack Query (React Query) for data fetching/caching
- TailwindCSS + DaisyUI components
- Vite

## Product Scope

### Core pipeline
- Leads
- Estimates (Draft → Sent → Accepted/Declined)
- Jobs (Scheduled → In Progress → Completed)
- Invoices (Draft/Issued → Paid/Overdue)

### Scoreboard (Dashboard)
A contractor-friendly snapshot:
- total leads
- estimates sent/accepted
- jobs scheduled
- invoices paid/unpaid
- paid revenue

### Later (stretch)
- Workflow automation (rules + outbox + automation log)

## Repo Structure

```

bta-demo/
backend/
BtaDemo.Api/
Api/Controllers/
Application/
Dtos/
Services/
Data/
Domain/
frontend/
bta-demo-web/
src/
routes/        # TanStack Router file-based routes
api/           # API client + query hooks
components/
pages/
docker-compose.yml

````

## Getting Started

### Prereqs
- .NET 10 SDK + ASP.NET runtime
- Node.js 25
- Docker (recommended for Postgres)

### 1) Start Postgres
From repo root:
```bash
docker compose up -d
````

Example `docker-compose.yml` service:

* Postgres on `localhost:5432`
* db: `bta_demo`
* user/pass: `postgres/postgres`

### 2) Backend (API)

```bash
cd backend/BtaDemo.Api
dotnet restore
dotnet build
dotnet run
```

#### EF migrations

If using local tool manifest:

```bash
dotnet tool restore
dotnet tool run dotnet-ef -- migrations add Initial
dotnet tool run dotnet-ef -- database update
```

### 3) Frontend (Web)

```bash
cd frontend/bta-demo-web
bun install
bun run dev
```

## API Overview (initial)

### Leads

* `POST /leads` create lead
* `GET /leads` list/search (optional early)

### Estimates

* `POST /estimates` create estimate
* `POST /estimates/{id}/send` transition Draft → Sent
* `POST /estimates/{id}/accept` transition Sent → Accepted (and may auto-create Job + Invoice as a demo behavior)

### Jobs

* `POST /jobs` create/schedule job
* `POST /jobs/{id}/start` Scheduled → In Progress (later)
* `POST /jobs/{id}/complete` In Progress → Completed (later)

### Invoices

* `POST /invoices/{id}/mark-paid` set Paid

### Dashboard

* `GET /dashboard/scoreboard` aggregated stats for the home page

## Frontend Data Access Patterns

* All server calls go through a small API client layer in `src/api/`
* TanStack Query owns caching + loading/error states
* Query keys are stable and composable:

  * `['leads']`
  * `['lead', leadId]`
  * `['estimates']`
  * `['dashboard', 'scoreboard']`

Mutations invalidate relevant queries (e.g. accepting an estimate invalidates scoreboard + pipeline queries).

## Domain knowledge

Lead → Estimate → Job → Invoice → Paid

But with one important nuance:
Lead is the “opportunity / customer context” (the umbrella)
Estimate, Job, Invoice are artifacts under that lead/customer
A lead can die (no estimate), stall (estimate sent), or convert (accepted → job)
So: a lead doesn’t “become” a job. It produces a job after a conversion event (usually estimate accepted). That keeps your state machine sane and your kanban meaningful.

Recommended domain relationships (what to implement)
Entities + cardinality (simple and demo-friendly)

Lead (1) → Estimates (0..N)
Lead (1) → Jobs (0..N)
Job (1) → Invoices (0..N) (start with 0..1 for MVP)
Job (0..1) → Estimate (optional link)

This handles reality:
Some jobs are booked without formal estimates (urgent service calls)
Some leads have multiple estimates (revisions / options)
Some jobs have multiple invoices (deposit + final)

## Notes / Known Issues

* .NET 10 template/SDK bug may require:

  ```xml
  <PropertyGroup>
    <AllowMissingPrunePackageData>true</AllowMissingPrunePackageData>
  </PropertyGroup>
  ```
* On Arch, ensure `aspnet-runtime` is installed (needed for ASP.NET shared framework).

````
