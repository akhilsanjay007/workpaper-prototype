"use client";

import type { ReactNode } from "react";
import { Check, CheckCircle2, Circle, ClipboardList, Shield, UserRound } from "lucide-react";
import { listBlockers } from "@/lib/filing";
import type { Diagnostic } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { useWorkpaper } from "@/lib/workpaper-store";
import { NoteForm } from "@/components/note-form";
import { Button, Card } from "@/components/ui";

const ENGAGEMENT_STEP = "Engagement letter and consents signed";
const DUE_DILIGENCE_STEP = "Due diligence completed";
const DIAGNOSTICS_STEP = "Diagnostics resolved";
const REVIEWER_STEP = "Reviewer sign-off";
const PARTNER_STEP = "Partner sign-off";
const CLIENT_STEP = "Client approval and e-file authorization";

function initials(name: string | undefined): string {
  if (!name) return "";
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

function SignCard({
  title,
  name,
  signed,
  children,
}: {
  title: string;
  name: string | undefined;
  signed: boolean;
  children: ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${
            signed ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
          }`}
        >
          {signed && name ? initials(name) : <UserRound className="h-4 w-4" aria-hidden />}
        </span>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          <p className={`text-xs ${signed ? "text-emerald-700" : "text-slate-500"}`}>
            {signed ? "Signed" : "Waiting"}
          </p>
        </div>
      </div>
      {children}
    </Card>
  );
}

function signedLabel(name: string | undefined, at: string | undefined): string {
  if (!name || !at) return "Not signed";
  return `Signed by ${name} · ${new Date(at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}`;
}

export function ReviewBoard({
  diagnostics,
  steps,
  engagementEventId,
}: {
  diagnostics: Diagnostic[];
  steps: string[];
  engagementEventId: string | null;
}) {
  const store = useWorkpaper();
  const nameOf = (id: string | undefined) => store.staff.find((person) => person.id === id)?.name;
  const dueComplete =
    store.dueDiligence.child && store.dueDiligence.otherDependent && store.dueDiligence.form8867;
  const openWarnings = diagnostics.filter(
    (item) => item.severity === "warning" && store.statusOf(item.code) === "open",
  );
  const openReviewNotes = store.notes.filter((note) => note.kind === "review" && note.open);
  const blockers = listBlockers({
    diagnostics,
    statuses: store.statuses,
    dueDiligenceComplete: dueComplete,
    openReviewNotes: openReviewNotes.length,
    preparerSignoff: store.preparerSignoff,
    reviewerSignoff: store.reviewerSignoff,
    partnerSignoff: store.partnerSignoff,
    adjustmentNeedsPartner: Boolean(store.adjustment?.needsPartner),
    adjustmentApproved: Boolean(store.adjustment?.partnerApprovedBy),
  });

  const reviewerReasons: string[] = [];
  if (store.current.role !== "reviewer") reviewerReasons.push("Only the reviewer can sign here.");
  if (store.preparerSignoff?.staffId === store.current.id) {
    reviewerReasons.push("You prepared this return and cannot review it.");
  }
  if (openWarnings.length > 0) reviewerReasons.push("Resolve open warnings before reviewer sign-off.");
  if (openReviewNotes.length > 0) reviewerReasons.push("Clear open review notes before reviewer sign-off.");

  const partnerReasons: string[] = [];
  if (store.current.role !== "partner") partnerReasons.push("Only the partner can sign here.");
  if (!store.reviewerSignoff) partnerReasons.push("Reviewer sign-off comes first.");

  function stepState(step: string): { done: boolean; detail: string; toggle: boolean } {
    if (step === ENGAGEMENT_STEP) {
      return {
        done: Boolean(engagementEventId),
        detail: engagementEventId ? `Evidenced by ${engagementEventId}` : "No engagement event in the timeline",
        toggle: false,
      };
    }
    if (step === DUE_DILIGENCE_STEP) {
      return { done: dueComplete, detail: dueComplete ? "Checklist complete" : "Checklist incomplete", toggle: false };
    }
    if (step === DIAGNOSTICS_STEP) {
      return {
        done: openWarnings.length === 0,
        detail: openWarnings.length === 0 ? "No open warnings" : `${openWarnings.length} warnings still open`,
        toggle: false,
      };
    }
    if (step === REVIEWER_STEP) {
      return {
        done: Boolean(store.reviewerSignoff),
        detail: signedLabel(nameOf(store.reviewerSignoff?.staffId), store.reviewerSignoff?.at),
        toggle: false,
      };
    }
    if (step === PARTNER_STEP) {
      return {
        done: Boolean(store.partnerSignoff),
        detail: signedLabel(nameOf(store.partnerSignoff?.staffId), store.partnerSignoff?.at),
        toggle: false,
      };
    }
    if (step === CLIENT_STEP) {
      return { done: false, detail: "Not in this demo", toggle: false };
    }
    return {
      done: Boolean(store.manualSteps[step]),
      detail: store.manualSteps[step] ? "Completed in this session" : "Not completed",
      toggle: true,
    };
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <SignCard title="Preparer" name={nameOf(store.preparerSignoff?.staffId)} signed={Boolean(store.preparerSignoff)}>
          <p className="mt-3 text-sm text-slate-600">
            {signedLabel(nameOf(store.preparerSignoff?.staffId), store.preparerSignoff?.at)}
          </p>
          {!store.preparerSignoff && store.current.role === "preparer" ? (
            <Button type="button" className="mt-3" onClick={store.signPreparer}>
              <Check className="h-4 w-4" aria-hidden />
              Sign as preparer
            </Button>
          ) : null}
          {!store.preparerSignoff && store.current.role !== "preparer" ? (
            <p className="mt-2 text-sm text-slate-500">Only a preparer can sign here.</p>
          ) : null}
        </SignCard>
        <SignCard title="Reviewer" name={nameOf(store.reviewerSignoff?.staffId)} signed={Boolean(store.reviewerSignoff)}>
          <p className="mt-3 text-sm text-slate-600">
            {signedLabel(nameOf(store.reviewerSignoff?.staffId), store.reviewerSignoff?.at)}
          </p>
          {!store.reviewerSignoff ? (
            <>
              <Button
                type="button"
                className="mt-3"
                disabled={reviewerReasons.length > 0}
                onClick={store.signReviewer}
              >
                <Check className="h-4 w-4" aria-hidden />
                Sign as reviewer
              </Button>
              {reviewerReasons.map((reason) => (
                <p key={reason} className="mt-2 text-sm text-slate-500">
                  {reason}
                </p>
              ))}
            </>
          ) : null}
        </SignCard>
        <SignCard title="Partner" name={nameOf(store.partnerSignoff?.staffId)} signed={Boolean(store.partnerSignoff)}>
          <p className="mt-3 text-sm text-slate-600">
            {signedLabel(nameOf(store.partnerSignoff?.staffId), store.partnerSignoff?.at)}
          </p>
          {!store.partnerSignoff ? (
            <>
              <Button
                type="button"
                className="mt-3"
                disabled={partnerReasons.length > 0}
                onClick={store.signPartner}
              >
                <Check className="h-4 w-4" aria-hidden />
                Sign as partner
              </Button>
              {partnerReasons.map((reason) => (
                <p key={reason} className="mt-2 text-sm text-slate-500">
                  {reason}
                </p>
              ))}
            </>
          ) : null}
        </SignCard>
      </div>

      {store.adjustment?.needsPartner ? (
        <Card className="p-5">
          <h2 className="text-base font-semibold text-slate-900">Basis adjustment approval</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            New basis {formatMoney(store.adjustment.newBasis)}. Federal tax change{" "}
            {formatMoney(store.adjustment.federalTaxChange)}. California tax change{" "}
            {formatMoney(store.adjustment.californiaTaxChange)}.
          </p>
          {store.adjustment.partnerApprovedBy ? (
            <p className="mt-2 text-sm text-slate-800">Approved by {nameOf(store.adjustment.partnerApprovedBy)}.</p>
          ) : store.current.role === "partner" && !store.efile ? (
            <Button type="button" className="mt-3" onClick={store.approveAdjustment}>
              <Check className="h-4 w-4" aria-hidden />
              Approve adjustment
            </Button>
          ) : (
            <p className="mt-2 text-sm text-amber-800">Waiting for Helen Strand.</p>
          )}
        </Card>
      ) : null}

      <Card className="p-5">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <ClipboardList className="h-4 w-4 text-slate-400" aria-hidden />
          Required steps
        </h2>
        <ul className="mt-4 divide-y divide-slate-200">
          {steps.map((step) => {
            const state = stepState(step);
            return (
              <li key={step} className="flex items-start justify-between gap-4 py-3">
                <label className="flex items-start gap-3 text-sm text-slate-800">
                  {state.toggle ? (
                    <input
                      type="checkbox"
                      className="mt-1 size-4 accent-teal-800"
                      checked={state.done}
                      disabled={store.current.role !== "preparer" || Boolean(store.efile)}
                      onChange={(event) => store.setManualStep(step, event.target.checked)}
                    />
                  ) : state.done ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  ) : (
                    <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" aria-hidden />
                  )}
                  <span>
                    {step}
                    <span className="mt-1 block text-xs text-slate-500">{state.detail}</span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
        {blockers.length > 0 ? (
          <p className="mt-2 text-xs text-slate-500">Filing stays blocked until the banner is clear.</p>
        ) : null}
      </Card>

      <NoteForm code={null} reviewFile />

      <Card className="p-5">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <Shield className="h-4 w-4 text-slate-400" aria-hidden />
          Sensitive-data log
        </h2>
        {store.unmaskLog.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No sensitive values revealed.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {store.unmaskLog.map((entry) => (
              <li key={entry.key}>
                {entry.staffName} revealed {entry.label} ·{" "}
                {new Date(entry.at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
