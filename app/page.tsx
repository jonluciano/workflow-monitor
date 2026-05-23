"use client";

import { useState } from "react";

type WorkflowRun = {
  id: string;
  workflowName: string;
  workflowType: "support" | "inbox" | "document" | "lead";
  status: "success" | "failed" | "review_required";
  confidence: number;
  requiresReview: boolean;
  createdAt: string;
  owner: string;
  
  input: string;
  output: string;
  prompt: string;
  debugNotes: string;
  validationErrors: string[];
};

const mockRuns: WorkflowRun[] = [
  {
    id: "RUN-1001",
    workflowName: "Support Ticket Classifier",
    workflowType: "support",
    status: "success",
    confidence: 0.96,
    requiresReview: false,
    createdAt: "2026-05-20",
    owner: "Support Ops",
    input: "Customer cannot access dashboard before meeting.",
    output: "Classified as technical, high urgency, routed to Technical Support.",
    prompt: "Classify this support ticket by category, urgency, severity, and sentiment.",
    debugNotes: "High confidence classification. No validation issues found.",
    validationErrors: [],
  },
  {
    id: "RUN-1002",
    workflowName: "Invoice Extraction",
    workflowType: "document",
    status: "failed",
    confidence: 0.72,
    requiresReview: true,
    createdAt: "2026-05-21",
    owner: "Document Ops",
    input: "Invoice INV-1045 with mismatched total.",
    output: "Extracted invoice fields but validation failed.",
    debugNotes: "Validation failed due to mismatched total.",
    prompt: "Extract invoice fields from the provided document.",
    validationErrors: ["Subtotal + tax does not equal total"],
  },
  {
    id: "RUN-1003",
    workflowName: "Shared Inbox Assistant",
    workflowType: "inbox",
    status: "review_required",
    confidence: 0.81,
    requiresReview: true,
    createdAt: "2026-05-22",
    owner: "Operations",
    input: "Ambiguous vendor email asking for document review.",
    output: "Could not confidently determine next action.",
    debugNotes: "Low confidence classification. Requires manual review.",
    prompt: "Determine next action for ambiguous vendor email asking for document review.",
    validationErrors: ["Low confidence classification"],
  },
  {
    id: "RUN-1004",
    workflowName: "Lead Scoring Workflow",
    workflowType: "lead",
    status: "success",
    confidence: 0.93,
    requiresReview: false,
    createdAt: "2026-05-23",
    owner: "Sales Ops",
    input: "BrightPath Clinics lead asking about intake automation.",
    output: "Scored as hot lead and routed to Sales.",
    debugNotes: "High confidence scoring. No validation issues found.",
    prompt: "Score the lead based on their request for intake automation.",
    validationErrors: [],
  },
];

function getStatusBadge(status: WorkflowRun["status"]) {
  if (status === "success") {
    return "bg-green-100 text-green-800";
  }

  if (status === "failed") {
    return "bg-red-100 text-red-800";
  }

  return "bg-yellow-100 text-yellow-800";
}

export default function Home() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedRun, setSelectedRun] = useState<WorkflowRun | null>(null);
  const [reviewDecisions, setReviewDecisions] = useState<Record<string, string>>({})  ;

  const filteredRuns = mockRuns.filter((run) => {
    const matchesStatus =
      statusFilter === "all" || run.status === statusFilter;

    const matchesType =
      typeFilter === "all" || run.workflowType === typeFilter;

    return matchesStatus && matchesType;
  });

  const reviewQueue = mockRuns.filter(
    (run) =>
      run.requiresReview ||
      run.status === "failed" ||
      run.status === "review_required" ||
      run.confidence < 0.85
  );
  function handleReviewDecision(runId: string, decision: string) {
    setReviewDecisions((current) => ({
      ...current,
      [runId]: decision,
    }));
  }
  const totalRuns = mockRuns.length;

  const failedRuns = mockRuns.filter(
    (run) => run.status === "failed"
  ).length;
  
  const reviewRuns = mockRuns.filter(
    (run) => run.requiresReview
  ).length;
  
  const successfulRuns = mockRuns.filter(
    (run) => run.status === "success"
  ).length;
  
  const avgConfidence =
    mockRuns.reduce((sum, run) => sum + run.confidence, 0) / mockRuns.length;
  
  const failureRate = failedRuns / totalRuns;
  const reviewRate = reviewRuns / totalRuns;
  const successRate = successfulRuns / totalRuns;
  
  const documentRuns = mockRuns.filter(
    (run) => run.workflowType === "document"
  ).length;
  
  const supportRuns = mockRuns.filter(
    (run) => run.workflowType === "support"
  ).length;
  
  const inboxRuns = mockRuns.filter(
    (run) => run.workflowType === "inbox"
  ).length;
  
  const leadRuns = mockRuns.filter(
    (run) => run.workflowType === "lead"
  ).length;

  return (
    <main className="min-h-screen bg-slate-100 p-8 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-blue-800">
            AI Workflow Monitor
          </h1>
          <p className="mt-2 text-slate-600">
            Monitor AI workflow runs, review failures, and inspect outputs.
          </p>
        </header>

        <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-slate-500">Total Runs</p>
            <p className="mt-2 text-3xl font-bold">{totalRuns}</p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-slate-500">Failed Runs</p>
            <p className="mt-2 text-3xl font-bold">{failedRuns}</p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-slate-500">Manual Reviews</p>
            <p className="mt-2 text-3xl font-bold">{reviewRuns}</p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-slate-500">Avg Confidence</p>
            <p className="mt-2 text-3xl font-bold">
              {avgConfidence.toFixed(2)}
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow">
  <p className="text-sm text-slate-500">Success Rate</p>
  <p className="mt-2 text-3xl font-bold">
    {(successRate * 100).toFixed(0)}%
  </p>
</div>

<div className="rounded-xl bg-white p-6 shadow">
  <p className="text-sm text-slate-500">Failure Rate</p>
  <p className="mt-2 text-3xl font-bold">
    {(failureRate * 100).toFixed(0)}%
  </p>
</div>

<div className="rounded-xl bg-white p-6 shadow">
  <p className="text-sm text-slate-500">Review Rate</p>
  <p className="mt-2 text-3xl font-bold">
    {(reviewRate * 100).toFixed(0)}%
  </p>
</div>
        </section>
        <section className="mb-8 rounded-xl bg-white p-6 shadow">
  <h2 className="mb-4 text-2xl font-semibold text-slate-900">
    Workflow Type Breakdown
  </h2>

  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
    <div className="rounded-lg bg-slate-100 p-4">
      <p className="text-sm text-slate-500">Support Runs</p>
      <p className="mt-2 text-2xl font-bold">{supportRuns}</p>
    </div>

    <div className="rounded-lg bg-slate-100 p-4">
      <p className="text-sm text-slate-500">Inbox Runs</p>
      <p className="mt-2 text-2xl font-bold">{inboxRuns}</p>
    </div>

    <div className="rounded-lg bg-slate-100 p-4">
      <p className="text-sm text-slate-500">Document Runs</p>
      <p className="mt-2 text-2xl font-bold">{documentRuns}</p>
    </div>

    <div className="rounded-lg bg-slate-100 p-4">
      <p className="text-sm text-slate-500">Lead Runs</p>
      <p className="mt-2 text-2xl font-bold">{leadRuns}</p>
    </div>
  </div>
</section>

        <section className="mb-6 rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Filters</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-600">
                Status
              </span>
              <select
                className="rounded-lg border border-slate-300 p-2"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="review_required">Review Required</option>
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-600">
                Workflow Type
              </span>
              <select
                className="rounded-lg border border-slate-300 p-2"
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
              >
                <option value="all">All types</option>
                <option value="support">Support</option>
                <option value="inbox">Inbox</option>
                <option value="document">Document</option>
                <option value="lead">Lead</option>
              </select>
            </label>
          </div>
        </section>
        <section className="mb-8 rounded-xl bg-white p-6 shadow">
  <div className="mb-4 flex items-center justify-between">
    <div>
      <h2 className="text-2xl font-semibold text-slate-900">
        Manual Review Queue
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Low-confidence, failed, or review-required workflow runs.
      </p>
    </div>

    <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
      {reviewQueue.length} pending
    </span>
  </div>

  <div className="grid grid-cols-1 gap-4">
    {reviewQueue.map((run) => (
      <div
        key={run.id}
        className="rounded-lg border border-slate-200 bg-slate-50 p-4"
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-900">
              {run.id} — {run.workflowName}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Owner: {run.owner} • Confidence: {run.confidence}
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusBadge(
              run.status
            )}`}
          >
            {run.status}
          </span>
        </div>

        <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-md bg-white p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Input
            </p>
            <p className="mt-1 text-sm text-slate-700">{run.input}</p>
          </div>

          <div className="rounded-md bg-white p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Output
            </p>
            <p className="mt-1 text-sm text-slate-700">{run.output}</p>
          </div>
        </div>

        <div className="mb-4 rounded-md bg-white p-3">
          <p className="text-xs font-semibold uppercase text-slate-500">
            Review Reason
          </p>

          {run.validationErrors.length > 0 ? (
            <ul className="mt-1 list-disc pl-5 text-sm text-slate-700">
              {run.validationErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-slate-700">
              Low confidence or manual review required.
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            className="rounded-lg bg-green-700 px-3 py-2 text-sm font-medium text-white hover:bg-green-800"
            onClick={() => handleReviewDecision(run.id, "approved")}
          >
            Approve
          </button>

          <button
            className="rounded-lg bg-red-700 px-3 py-2 text-sm font-medium text-white hover:bg-red-800"
            onClick={() => handleReviewDecision(run.id, "rejected")}
          >
            Reject
          </button>

          <button
            className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
            onClick={() => handleReviewDecision(run.id, "needs_correction")}
          >
            Send Back
          </button>

          <button
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-white"
            onClick={() => setSelectedRun(run)}
          >
            View Full Details
          </button>
        </div>

        {reviewDecisions[run.id] && (
          <p className="mt-3 rounded-md bg-blue-50 p-3 text-sm font-medium text-blue-800">
            Review decision saved locally: {reviewDecisions[run.id]}
          </p>
        )}
      </div>
    ))}
  </div>
</section>
        <section className="rounded-xl bg-white shadow">
          <div className="border-b p-6">
            <h2 className="text-2xl font-semibold">Workflow Runs</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="p-4">Run ID</th>
                  <th className="p-4">Workflow</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Confidence</th>
                  <th className="p-4">Review?</th>
                  <th className="p-4">Created</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredRuns.map((run) => (
                  <tr key={run.id} className="border-t">
                    <td className="p-4 font-medium">{run.id}</td>
                    <td className="p-4">{run.workflowName}</td>
                    <td className="p-4 capitalize">{run.workflowType}</td>
                    <td className="p-4"><span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusBadge(
                          run.status
                        )}`}
                        >
                          {run.status}
                          </span>
                    </td>
                    <td className="p-4">{run.confidence}</td>
                    <td className="p-4">
                      {run.requiresReview ? "Yes" : "No"}
                    </td>
                    <td className="p-4">{run.createdAt}</td>
                    <td className="p-4">
                      <button
                        className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-medium text-white hover:bg-blue-800"
                        onClick={() => {
                          console.log("Clicked:", run.id);
                          setSelectedRun(run);
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {selectedRun && (
  <section className="mt-8 rounded-xl border-4 border-blue-500 bg-white p-6 shadow-2xl">
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-semibold">
          Run Detail: {selectedRun.id}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {selectedRun.workflowName} • {selectedRun.createdAt}
        </p>
      </div>

      <button
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
        onClick={() => setSelectedRun(null)}
      >
        Close
      </button>
    </div>

    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
      <div className="rounded-lg bg-slate-100 p-4">
        <p className="text-sm text-slate-500">Status</p>
        <span
          className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-medium ${getStatusBadge(
            selectedRun.status
          )}`}
        >
          {selectedRun.status}
        </span>
      </div>

      <div className="rounded-lg bg-slate-100 p-4">
        <p className="text-sm text-slate-500">Confidence</p>
        <p className="mt-2 text-2xl font-bold">
          {selectedRun.confidence}
        </p>
      </div>

      <div className="rounded-lg bg-slate-100 p-4">
        <p className="text-sm text-slate-500">Requires Review</p>
        <p className="mt-2 text-2xl font-bold">
          {selectedRun.requiresReview ? "Yes" : "No"}
        </p>
      </div>

      <div className="rounded-lg bg-slate-100 p-4">
        <p className="text-sm text-slate-500">Owner</p>
        <p className="mt-2 text-lg font-semibold">
          {selectedRun.owner}
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        <p className="mb-2 text-sm font-semibold text-slate-500">
          Prompt
        </p>
        <pre className="min-h-32 whitespace-pre-wrap rounded-lg bg-slate-950 p-4 text-sm text-slate-100">
          {selectedRun.prompt}
        </pre>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-slate-500">
          Input
        </p>
        <pre className="min-h-32 whitespace-pre-wrap rounded-lg bg-slate-100 p-4 text-sm">
          {selectedRun.input}
        </pre>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-slate-500">
          Output
        </p>
        <pre className="min-h-32 whitespace-pre-wrap rounded-lg bg-slate-100 p-4 text-sm">
          {selectedRun.output}
        </pre>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-slate-500">
          Validation Errors
        </p>
        <div className="min-h-32 rounded-lg bg-slate-100 p-4 text-sm">
          {selectedRun.validationErrors.length > 0 ? (
            <ul className="list-disc pl-5">
              {selectedRun.validationErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          ) : (
            <p>No validation errors</p>
          )}
        </div>
      </div>

      <div className="md:col-span-2">
        <p className="mb-2 text-sm font-semibold text-slate-500">
          Debugging Notes
        </p>
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
          {selectedRun.debugNotes}
        </div>
      </div>
    </div>
  </section>
)}
      </div>
    </main>
  );
}