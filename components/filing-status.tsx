"use client";

import { useState } from "react";
import { Check, FileCheck, Lock, Send } from "lucide-react";
import { listBlockers } from "@/lib/filing";
import type { Diagnostic } from "@/lib/types";
import { useWorkpaper } from "@/lib/workpaper-store";
import { Button, Card } from "@/components/ui";

export function useFilingProgress(diagnostics: Diagnostic[]) {
  const store = useWorkpaper();
  const blockers = listBlockers({
    diagnostics,
    statuses: store.statuses,
    dueDiligenceComplete:
      store.dueDiligence.child && store.dueDiligence.otherDependent && store.dueDiligence.form8867,
    openReviewNotes: store.notes.filter((note) => note.kind === "review" && note.open).length,
    preparerSignoff: store.preparerSignoff,
    reviewerSignoff: store.reviewerSignoff,
    partnerSignoff: store.partnerSignoff,
    adjustmentNeedsPartner: Boolean(store.adjustment?.needsPartner),
    adjustmentApproved: Boolean(store.adjustment?.partnerApprovedBy),
  });

  return {
    store,
    blockers,
    ready: blockers.length === 0,
    approved: Boolean(store.clientApproval),
    filed: Boolean(store.efile),
  };
}

export function formatStamp(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

export function FilingStepper({ diagnostics }: { diagnostics: Diagnostic[] }) {
  const { ready, approved, filed } = useFilingProgress(diagnostics);
  const steps = [
    { label: "Review", done: ready || filed, Icon: Check },
    { label: "Client approval", done: approved || filed, Icon: Send },
    { label: "E-file", done: filed, Icon: FileCheck },
  ];

  return (
    <ol className="grid gap-3 sm:grid-cols-3">
      {steps.map((step, index) => {
        const waiting = !step.done && steps.slice(0, index).every((earlier) => earlier.done);
        return (
          <li
            key={step.label}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-sm ${
              step.done
                ? "border-emerald-200 bg-emerald-50"
                : waiting
                  ? "border-teal-200 bg-white"
                  : "border-slate-200 bg-white"
            }`}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                step.done ? "bg-emerald-600 text-white" : waiting ? "bg-teal-800 text-white" : "bg-slate-100 text-slate-400"
              }`}
            >
              <step.Icon className="h-4 w-4" aria-hidden />
            </span>
            <span>
              <span className="block text-sm font-semibold text-slate-900">{step.label}</span>
              <span className={`block text-xs ${step.done ? "text-emerald-700" : "text-slate-500"}`}>
                {step.done ? "Complete" : waiting ? "Current" : "Waiting"}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function EfilePanel({ diagnostics }: { diagnostics: Diagnostic[] }) {
  const { ready, approved, store } = useFilingProgress(diagnostics);
  const [pending, setPending] = useState(false);
  const receipt = store.efile;

  async function onFile() {
    if (!ready || !store.clientApproval || receipt || pending) return;
    setPending(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    store.fileReturn();
    setPending(false);
  }

  if (receipt) {
    return (
      <Card className="p-5">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <FileCheck className="h-4 w-4 text-emerald-600" aria-hidden />
          E-file accepted
        </h2>
        <p className="mt-2 text-sm text-slate-800">Acknowledgment {receipt.acknowledgment}</p>
        <p className="mt-1 text-sm text-slate-600">{formatStamp(receipt.at)}</p>
        <p className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-800">
          <Lock className="h-4 w-4" aria-hidden />
          Return filed — locked
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
        <Send className="h-4 w-4 text-slate-400" aria-hidden />
        E-file
      </h2>
      {approved && ready ? (
        <Button type="button" className="mt-4" disabled={pending} onClick={onFile}>
          <Send className="h-4 w-4" aria-hidden />
          {pending ? "Filing…" : "E-file return"}
        </Button>
      ) : (
        <p className="mt-2 text-sm text-slate-600">E-file opens after the client approves a clear return.</p>
      )}
    </Card>
  );
}
