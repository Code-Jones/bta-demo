<context>

# Overview

This product is a **contractor operations dashboard** designed to help trade and construction businesses clearly manage and understand their business through **systems, pipelines, and accountability**.

The core problem it solves is that many contractors run their businesses through disconnected tools, ad-hoc processes, and intuition instead of visibility. Leads, estimates, jobs, and invoices exist, but there is no single, coherent system showing how work flows through the business or where breakdowns occur.

The product is for:

* Trade contractors (plumbing, electrical, HVAC, construction)
* Owners and managers responsible for sales, operations, and cash flow
* Coaches or advisors who want visibility into execution and follow-through

The value comes from:

* A **clear pipeline** from lead → estimate → job → invoice
* A **scoreboard** that reflects real business health
* **Explicit transitions** that make accountability visible
* A foundation for **workflow automation** without overengineering

This demo intentionally avoids being a generic CRM. It focuses on **operational clarity**, not contact storage.

---

# Core Features

## 1. Contractor Pipeline

**What it does**
Represents work flowing through defined business stages:

* Leads
* Estimates (Draft, Sent, Accepted/Declined)
* Jobs (Scheduled, In Progress, Completed)
* Invoices (Draft, Issued, Paid, Overdue)

**Why it’s important**
Contractors think in stages, not entities. Visibility into where work stalls is more valuable than raw data.

**How it works (high level)**

* Each stage has explicit states and timestamps
* State transitions are enforced by the backend
* The UI reflects the current position of each item in the pipeline

---

## 2. Business Scoreboard (Dashboard)

**What it does**
Provides a real-time snapshot of business performance.

**Why it’s important**
Owners need fast answers:

* Are we closing work?
* Are jobs scheduled?
* Are we getting paid?

**How it works (high level)**

* Aggregated queries over pipeline data
* KPI cards and simple charts
* Designed for at-a-glance clarity, not deep analytics

---

## 3. Lead & Customer Management

**What it does**
Allows users to create and view leads and associated customers.

**Why it’s important**
Leads are the entry point of the system. Everything else depends on them.

**How it works (high level)**

* Leads are simple, lightweight records
* Lead details show all downstream activity (estimates, jobs, invoices)
* No over-modeling of CRM concepts

---

## 4. Estimates & State Transitions

**What it does**
Manages estimates and their lifecycle:

* Create
* Send
* Accept / Decline

**Why it’s important**
Estimates are the primary sales conversion point. Their status drives operational decisions.

**How it works (high level)**

* Estimates have explicit state transitions
* Invalid transitions are rejected by the domain logic
* Accepting an estimate can trigger downstream actions (job + invoice creation)

---

## 5. Jobs & Scheduling

**What it does**
Tracks scheduled and active work.

**Why it’s important**
Jobs represent real operational commitments and capacity planning.

**How it works (high level)**

* Jobs are created manually or automatically from accepted estimates
* Status progression reflects execution

---

## 6. Invoicing & Cash Visibility

**What it does**
Tracks invoicing and payment status.

**Why it’s important**
Cash flow is the most critical metric for contractors.

**How it works (high level)**

* Invoices are tied to jobs
* Payment events update the scoreboard in real time

---

## 7. Automation & Activity Log (Foundation)

**What it does**
Records system-driven actions and state changes.

**Why it’s important**
Accountability requires traceability. Automation must be explainable.

**How it works (high level)**

* State transitions emit events
* Events are recorded in an activity log
* Serves as the basis for future workflow automation

---

# User Experience

## User Personas

### Contractor Owner

* Wants clarity, not complexity
* Looks at the dashboard daily
* Cares about pipeline health and cash flow

### Operations Manager

* Manages jobs and scheduling
* Needs visibility into what’s accepted and what’s upcoming

### Coach / Advisor

* Reviews business performance
* Looks for stalled pipeline stages and follow-through

---

## Key User Flows

### Primary Flow (Happy Path)

1. Create lead
2. Create estimate
3. Send estimate
4. Accept estimate
5. Job and invoice created automatically
6. Invoice marked paid
7. Scoreboard updates

### Secondary Flows

* Manual job scheduling
* Viewing customer history
* Reviewing automation/activity log

---

## UI / UX Considerations

* Desktop-first web UI
* Data-dense but readable
* Clear status indicators and timestamps
* Consistent layouts across pipeline entities
* Avoid “wizard” flows; favor direct actions

---

</context>

<PRD>

# Technical Architecture

## System Components

### Backend

* ASP.NET Core (.NET 10)
* ASP.NET Identity for authentication and user management
* EF Core with PostgreSQL
* RESTful API design

### Frontend

* React + TypeScript
* TanStack Router (file-based routing)
* TanStack Query for data fetching and caching
* TailwindCSS + DaisyUI for UI components

---

## Data Models (High Level)

* ApplicationUser (IdentityUser extension)
* Lead
* Estimate
* Job
* Invoice
* ActivityLog / AutomationEvent (future)

Entities are designed around **state transitions**, not CRUD convenience.

---

## APIs & Integrations

* Auth:

  * `/auth/login`
  * `/auth/register`
  * `/auth/me`
* Pipeline:

  * `/leads`
  * `/estimates`
  * `/jobs`
  * `/invoices`
* Dashboard:

  * `/dashboard/scoreboard`
* Automation:

  * `/automation/log` (initially read-only)

---

## Infrastructure Requirements

* PostgreSQL database
* Environment-variable–based configuration
* Docker for local development
* No external dependencies required for MVP

---

# Development Roadmap

## MVP Scope (Must Have)

* Identity-based authentication
* Lead creation and viewing
* Estimate creation and state transitions
* Job creation (manual + automatic on acceptance)
* Invoice tracking and payment marking
* Dashboard scoreboard
* Protected frontend routes
* Basic activity logging

---

## Phase 2 (Build-on Scope)

* Pipeline board UI
* Customer activity timeline
* Automation log UI
* Simple workflow rules (event → action)
* Improved error handling and validation

---

## Phase 3 (Stretch / Future)

* Company entity and multi-user support
* Role-based access
* Configurable automation rules
* Notifications (email/SMS placeholders)
* Reporting and historical analytics

---

# Logical Dependency Chain

1. Authentication + user model (foundation)
2. Core domain entities (Lead, Estimate, Job, Invoice)
3. Backend state transitions and validation
4. Minimal frontend with protected routing
5. Dashboard scoreboard (fast visible value)
6. Pipeline visualization
7. Activity/automation logging
8. Workflow automation

The goal is to reach a **usable, visible frontend early**, then incrementally deepen behavior without rewriting foundations.

---

# Risks and Mitigations

## Technical Complexity

**Risk:** Overengineering automation too early
**Mitigation:** Start with logging-only events and expand gradually

## MVP Scope Creep

**Risk:** Turning demo into a full CRM
**Mitigation:** Ruthless focus on pipeline + scoreboard only

## Time / Resource Constraints

**Risk:** Limited time to polish UI and backend
**Mitigation:** Prioritize end-to-end flow over feature breadth

---

# Appendix

## Design Principles

* State transitions > CRUD
* Visibility over configurability
* Simple systems that can evolve

## Notes

This PRD intentionally reflects **Breakthrough Academy’s philosophy**:

* Systems
* Accountability
* Measurable execution

It is designed to demonstrate both **technical competence** and **business understanding**.

</PRD>

---