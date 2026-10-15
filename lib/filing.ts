import type { Diagnostic } from "@/lib/types";

export type ItemStatus = "open" | "resolved" | "accepted";

export type Signoff = {
  staffId: string;
  at: string;
};

export type FilingSnapshot = {
  diagnostics: Diagnostic[];
  statuses: Record<string, ItemStatus>;
  dueDiligenceComplete: boolean;
  openReviewNotes: number;
  preparerSignoff: Signoff | null;
  reviewerSignoff: Signoff | null;
  partnerSignoff: Signoff | null;
  adjustmentNeedsPartner: boolean;
  adjustmentApproved: boolean;
};

export function itemStatus(statuses: Record<string, ItemStatus>, code: string): ItemStatus {
  return statuses[code] ?? "open";
}

export function listBlockers(snapshot: FilingSnapshot): string[] {
  const blockers: string[] = [];
  const openWarnings = snapshot.diagnostics.filter(
    (item) =>
      item.severity === "warning" &&
      item.code !== "DUE_DILIGENCE_REQUIRED" &&
      itemStatus(snapshot.statuses, item.code) === "open",
  );
  if (openWarnings.length > 0) {
    blockers.push(`Warnings still open: ${openWarnings.map((item) => item.code).join(", ")}`);
  }
  if (!snapshot.dueDiligenceComplete) {
    blockers.push("Due diligence checklist is incomplete");
  }
  if (snapshot.openReviewNotes > 0) {
    const label = snapshot.openReviewNotes === 1 ? "note" : "notes";
    blockers.push(`${snapshot.openReviewNotes} open review ${label}`);
  }
  if (!snapshot.preparerSignoff) {
    blockers.push("Preparer has not signed");
  }
  if (!snapshot.reviewerSignoff) {
    blockers.push("Reviewer has not signed");
  }
  if (
    snapshot.preparerSignoff &&
    snapshot.reviewerSignoff &&
    snapshot.preparerSignoff.staffId === snapshot.reviewerSignoff.staffId
  ) {
    blockers.push("Preparer and reviewer sign-off are the same person");
  }
  if (!snapshot.partnerSignoff) {
    blockers.push("Partner has not signed");
  }
  if (snapshot.adjustmentNeedsPartner && !snapshot.adjustmentApproved) {
    blockers.push("Crypto basis adjustment needs partner approval");
  }
  return blockers;
}
