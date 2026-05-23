AI Workflow Monitor — Product Spec
1. Overview
AI Workflow Monitor is an internal operations dashboard for watching, debugging, and improving AI-powered workflows. It gives ops and engineering a single place to see whether automations are healthy, which runs need human review, and where quality is slipping.

Workflows in scope (MVP):

Workflow	What it does (plain language)
Support Ticket Classifier
Reads incoming support tickets and suggests category, priority, and routing.
Shared Inbox Triage
Processes shared mailbox messages (assign, tag, draft reply).
Document Extraction
Pulls structured fields from uploaded documents (invoices, loss runs, etc.).
Lead Qualification
Scores and routes inbound leads based on fit and intent.
2. Users
Role	Who	Primary goals
Operations analyst
Support / inbox / ops staff
Clear review queue, approve or correct AI output quickly.
Workflow owner
PM or team lead per workflow
Spot failure spikes, tune confidence thresholds, report to leadership.
Engineer / ML owner
Builds or maintains pipelines
Drill into failed runs, compare inputs vs outputs, find regressions.
Leadership (read-only)
Managers
High-level health: volume, success rate, review backlog (Metrics + Dashboard).
Assumption for MVP: All users see the same data (no per-team permissions). Auth can be “internal SSO later”; MVP can use a static layout with mock data.

3. Problem Statement
AI workflows run in the background across tickets, email, documents, and leads. Today, teams lack a shared view of:

Whether a run succeeded, failed, or needs human review
Why something failed (error, low confidence, policy flag)
How much manual review backlog exists
Trends over time (are we getting better or worse?)
Without this tool, issues are discovered late (customer complaints, wrong routing, bad extractions). The Workflow Monitor makes runs visible, searchable, and actionable so ops can fix today’s problems and owners can improve tomorrow’s automation.

4. Core Screens (Next.js routing sketch)
Screen	Route (suggested)	Purpose
Dashboard overview
/
At-a-glance health + recent activity
Workflow runs table
/runs
Searchable list of all runs
Run detail
/runs/[runId]
Full story for one run
Review queue
/review
Runs waiting for human decision
Metrics
/metrics
Trends and quality over time
Global chrome (all screens): App title, nav links to the five areas, optional “last updated” timestamp (mock: static).

5. Fields, Filters, and Behavior by Screen
5.1 Dashboard overview (/)
Purpose: Answer “How are we doing right now?” in under 30 seconds.

KPI cards (top row):

Field	Type	Notes
Total runs (24h / 7d toggle)
number
Count in selected window
Success rate
%
success / (success + failed); exclude review_required from denominator or show footnote
Failed runs
number
status === failed
Review queue size
number
status === review_required and reviewedAt == null
Avg confidence
0–1
Mean of confidence for completed runs in window
Widgets below KPIs:

Widget	Fields shown	Interaction
Runs by workflow
Workflow name, count, mini success %
Click row → /runs?workflow=...
Runs by status
Status badge counts
Click → /runs?status=...
Recent failures
Run ID, workflow, error summary, startedAt
Row → /runs/[runId]
Review queue preview
Top 5 oldest waiting: Run ID, workflow, confidence, waitingSince
“View all” → /review
Filters (dashboard only):

Filter	Options	Default
Time range
Last 24h, 7d, 30d
24h
Workflow
All + four workflow types
All
5.2 Workflow runs table (/runs)
Purpose: Find any run; primary working list for engineers and owners.

Table columns:

Column	Field	Format
Run ID
id
Link to detail
Workflow
workflowType
Human label
Status
status
Badge: success, failed, review_required, running, cancelled
Confidence
confidence
0–1 or “—” if N/A
Source
sourceRef
e.g. ticket #, message ID, file name, lead ID
Started
startedAt
Relative + tooltip absolute
Duration
durationMs
e.g. 1.2s
Reviewed
reviewOutcome
approved, corrected, rejected, or empty
Triggered by
trigger
api, webhook, scheduled, manual
Filters (sticky bar above table):

Filter	Type	Options
Search
text
Run ID or source ref (partial match)
Workflow
multi-select
Four workflow types
Status
multi-select
All statuses
Confidence
range
Min / max slider (0–1)
Needs review
boolean
Only review_required and not reviewed
Date range
date
startedAt from / to
Review outcome
select
Any / not reviewed / approved / corrected / rejected
Table behavior (MVP):

Sort: default startedAt desc; clickable headers for ID, started, confidence, duration
Pagination: 25 per page (mock: slice in memory)
Row click → run detail
5.3 Run detail page (/runs/[runId])
Purpose: Debug one run end-to-end.

Header summary:

Field	Notes
Run ID
Workflow type + version
e.g. document-extraction v1.2
Status
Large badge
Confidence
With threshold line if workflow defines reviewThreshold
Started / ended
Timestamps
Duration
Source ref
Link-out placeholder (MVP: plain text)
Trigger
Sections (vertical layout):

Input

inputSummary (short text)
inputPayload (JSON viewer, collapsible) — redact PII in real app; MVP can show sample JSON
Output

outputSummary (what the AI decided)
outputPayload (JSON)
For extraction: key fields table (fieldName, value, confidence)
Steps / trace (optional MVP+)

List: stepName, status, durationMs, message
MVP: 0–3 mock steps if present on record
Error (if failed)

errorCode, errorMessage, stackTrace (collapsible, engineer-only styling)
Review (if applicable)

Review status, reviewer name (mock), reviewedAt, reviewNotes
Actions (MVP UI only, mock state update):
Approve — accept AI output
Correct — open simple form: corrected JSON or key fields
Reject — mark bad run, optional note
Related

parentRunId / childRunIds if chained workflows (optional mock)
Filters: None (single entity). Breadcrumb: Dashboard → Runs → {runId}.

5.4 Review queue (/review)
Purpose: Fast path for ops to clear items that need human eyes.

Queue table columns:

Column	Field
Priority
reviewPriority (high / normal / low) or derived from SLA
Waiting since
startedAt or flaggedAt
Run ID
link
Workflow
Confidence
highlight if below threshold
Source
sourceRef
AI summary
outputSummary (1–2 lines)
Suggested action
suggestedAction e.g. “Route to Billing”, “Extract 12 fields”
Filters:

Filter	Options
Workflow
multi-select
Priority
high / normal / low
Confidence below threshold
toggle
Oldest first / highest priority first
sort toggle
Bulk actions (post-MVP): assign reviewer, snooze. MVP: single-run actions on detail or inline “Open” only.

Empty state: “No items waiting for review” + link to Metrics.

5.5 Metrics page (/metrics)
Purpose: Trends for workflow owners and leadership.

Global filter bar:

Filter	Options	Default
Time range
7d, 30d, 90d
30d
Workflow
All or one
All
Granularity
Day / week
Day
Charts / stat blocks (MVP: simple cards + placeholder chart areas; data from mock aggregates):

Metric	Definition
Run volume
Count per day per workflow
Success rate
% success over time
Failure rate
% failed
Review rate
% ending in review_required
Avg confidence
Line or bar by workflow
Avg duration
ms, p50 optional post-MVP
Review outcomes
Stacked: approved / corrected / rejected
Top error codes
Table: errorCode, count, last seen
Manual correction rate
% of reviewed runs where outcome = corrected
Export (post-MVP): CSV download. MVP: display only.

6. Mock Data Model
Use TypeScript types in lib/types.ts and seed JSON or inline arrays in lib/mock-data.ts. Align with your existing prototype fields (id, workflow, status, confidence) while expanding names for clarity.

// Workflow types (enum)
type WorkflowType =
  | "support_ticket"
  | "shared_inbox"
  | "document_extraction"
  | "lead_qualification";
type RunStatus =
  | "running"
  | "success"
  | "failed"
  | "review_required"
  | "cancelled";
type ReviewOutcome = "approved" | "corrected" | "rejected" | null;
interface WorkflowRun {
  id: string;                    // e.g. "RUN-1001"
  workflowType: WorkflowType;
  workflowVersion: string;       // e.g. "1.0.0"
  status: RunStatus;
  confidence: number | null;     // 0-1, null if not applicable
  reviewThreshold: number;       // e.g. 0.85 — flag when below
  sourceRef: string;             // "TKT-8821", "MSG-441", "invoice_march.pdf"
  sourceSystem: string;          // "zendesk", "outlook", "s3", "hubspot"
  trigger: "api" | "webhook" | "scheduled" | "manual";
  startedAt: string;             // ISO 8601
  endedAt: string | null;
  durationMs: number | null;
  inputSummary: string;
  inputPayload: Record<string, unknown>;
  outputSummary: string;
  outputPayload: Record<string, unknown>;
  extractedFields?: { name: string; value: string; confidence: number }[];
  errorCode: string | null;
  errorMessage: string | null;
  stackTrace?: string | null;
  steps?: { name: string; status: RunStatus; durationMs: number; message?: string }[];
  reviewPriority?: "high" | "normal" | "low";
  flaggedAt?: string | null;
  suggestedAction?: string | null;
  reviewOutcome: ReviewOutcome;
  reviewedAt: string | null;
  reviewedBy: string | null;
  reviewNotes: string | null;
  parentRunId?: string | null;
}
// Aggregates for dashboard / metrics (precomputed in mock)
interface WorkflowMetricsSnapshot {
  workflowType: WorkflowType;
  periodStart: string;
  periodEnd: string;
  totalRuns: number;
  successCount: number;
  failedCount: number;
  reviewRequiredCount: number;
  avgConfidence: number;
  avgDurationMs: number;
}
Seed data guidelines:

~40–60 WorkflowRun records spanning last 30 days
Mix: ~70% success, ~15% failed, ~15% review_required
Each workflow type represented; 5–10 runs in review_required with reviewOutcome: null for the queue
Realistic sourceRef per workflow (ticket IDs, email subjects, filenames, lead emails)
3–5 distinct errorCode values for Metrics “top errors”
Status display labels (UI):

status	Label
success
Success
failed
Failed
review_required
Review Required
running
Running
cancelled
Cancelled
7. MVP Scope
In scope
Five routes with shared layout and navigation
Mock data only (no backend, no auth)
Dashboard KPIs + recent failures + review preview
Runs table with filters, sort, pagination (client-side)
Run detail with input/output JSON, error block, mock review buttons (local state)
Review queue filtered to unreviewed review_required
Metrics page with time/workflow filters and stat cards (charts can be static placeholders or simple CSS bars)
Responsive layout (readable on laptop; mobile nice-to-have)
Consistent status badges and confidence formatting (align with existing page.tsx table)
Out of scope (explicitly later)
Real API / database / webhooks
Authentication and role-based access
Live refresh / websockets
Editing workflow config or thresholds in UI
Bulk review, assignments, notifications
PII redaction pipeline
Export CSV, audit log
Automated tests beyond manual click-through (optional: one smoke test post-MVP)
Suggested Next.js structure
app/
  layout.tsx          # nav + shell
  page.tsx            # dashboard
  runs/
    page.tsx          # table
    [runId]/page.tsx  # detail
  review/page.tsx
  metrics/page.tsx
lib/
  types.ts
  mock-data.ts
  filters.ts          # pure functions: filterRuns(), aggregateMetrics()
components/
  StatusBadge.tsx
  RunsTable.tsx
  KpiCard.tsx
  ...
8. Success Criteria
Product / ops

An ops analyst can open Review queue, see why an item needs review, and open Run detail in under 3 clicks.
A workflow owner can answer within 1 minute: “How many failures yesterday for Document Extraction?” using Dashboard or Metrics.
An engineer can inspect input vs output JSON and error message for a failed run without leaving the app.
Implementation (MVP done when)

All five screens render from shared mock data with no broken links
Filters on Runs and Review visibly reduce the list (client-side)
Review actions on detail update UI state (e.g. move run out of queue in session)
Dashboard numbers match filtered mock aggregates (no hard-coded KPIs that disagree with table)
App runs with npm run dev on Windows without extra services
Quality bar

Beginner-readable labels (no internal jargon without tooltips)
Empty states on every list
Loading state pattern documented (MVP: instant; structure ready for future loading.tsx)
9. Glossary (beginner-friendly)
Term	Meaning
Workflow
A defined AI pipeline (e.g. classify ticket, extract invoice).
Run
One execution of that workflow on one item (one ticket, one email, etc.).
Confidence
Model’s certainty (0–1). Low scores often trigger review.
Review required
Automation paused until a human approves or corrects.
Source ref
ID of the business object the run processed.
10. Alignment with current prototype
Your existing app/page.tsx already shows Total Runs, Failed Runs, Manual Reviews, Avg Confidence, and a Recent Workflow Runs table with RUN-* IDs. The MVP above splits that into dedicated routes, adds filters, run detail, review queue, and metrics, and standardizes workflow names to the four types you listed (mapping “Invoice Extraction” / “Loss Run Extraction” under Document Extraction with distinct sourceRef / summaries).

When you want this written to workflow-monitor/PRODUCT_SPEC.md, say so and we can save it verbatim or adjust (e.g. add SSO, specific ticket systems, or chart library choice).