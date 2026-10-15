"use client";

import { createContext, useContext, useState } from "react";
import type { ItemStatus, Signoff } from "@/lib/filing";
import type { DemoStaff } from "@/lib/types";

export type Note = {
  id: string;
  code: string | null;
  text: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  kind: "work" | "review";
  open: boolean;
};

export type BasisAdjustment = {
  newBasis: number;
  reason: string;
  authority: string;
  newGain: number;
  federalTaxChange: number;
  californiaTaxChange: number;
  needsPartner: boolean;
  partnerApprovedBy: string | null;
};

export type DueDiligenceChecks = {
  child: boolean;
  otherDependent: boolean;
  form8867: boolean;
};

export type LowConfidenceDecision = {
  decision: "confirm" | "correct";
  amount: number;
};

export type UnmaskEntry = {
  key: string;
  staffId: string;
  staffName: string;
  label: string;
  at: string;
};

export type ClientApproval = {
  name: string;
  at: string;
};

export type EfileReceipt = {
  acknowledgment: string;
  at: string;
};

type WorkpaperContextValue = {
  staff: DemoStaff[];
  current: DemoStaff;
  setStaffId: (id: string) => void;
  notes: Note[];
  addNote: (code: string | null, text: string) => void;
  clearReviewNote: (id: string) => void;
  statuses: Record<string, ItemStatus>;
  statusOf: (code: string) => ItemStatus;
  setItemStatus: (code: string, status: ItemStatus) => void;
  adjustment: BasisAdjustment | null;
  setAdjustment: (adjustment: BasisAdjustment) => void;
  approveAdjustment: () => void;
  dueDiligence: DueDiligenceChecks;
  setDueDiligence: (key: keyof DueDiligenceChecks, checked: boolean) => void;
  lowConfidence: LowConfidenceDecision | null;
  setLowConfidence: (decision: LowConfidenceDecision) => void;
  manualSteps: Record<string, boolean>;
  setManualStep: (step: string, done: boolean) => void;
  preparerSignoff: Signoff | null;
  reviewerSignoff: Signoff | null;
  partnerSignoff: Signoff | null;
  signPreparer: () => void;
  signReviewer: () => boolean;
  signPartner: () => boolean;
  revealed: string[];
  unmaskLog: UnmaskEntry[];
  canSee: (key: string) => boolean;
  reveal: (key: string, label: string) => void;
  clientApproval: ClientApproval | null;
  efile: EfileReceipt | null;
  approveClient: () => void;
  fileReturn: () => void;
};

const WorkpaperContext = createContext<WorkpaperContextValue | null>(null);

function noteId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function WorkpaperProvider({
  staff,
  warningCodes,
  children,
}: {
  staff: DemoStaff[];
  warningCodes: string[];
  children: React.ReactNode;
}) {
  const [staffId, setStaffId] = useState(staff[0]?.id ?? "");
  const [notes, setNotes] = useState<Note[]>([]);
  const [statuses, setStatuses] = useState<Record<string, ItemStatus>>({});
  const [adjustment, setAdjustmentState] = useState<BasisAdjustment | null>(null);
  const [dueDiligence, setDueDiligenceState] = useState<DueDiligenceChecks>({
    child: false,
    otherDependent: false,
    form8867: false,
  });
  const [lowConfidence, setLowConfidenceState] = useState<LowConfidenceDecision | null>(null);
  const [manualSteps, setManualSteps] = useState<Record<string, boolean>>({});
  const [preparerSignoff, setPreparerSignoff] = useState<Signoff | null>(null);
  const [reviewerSignoff, setReviewerSignoff] = useState<Signoff | null>(null);
  const [partnerSignoff, setPartnerSignoff] = useState<Signoff | null>(null);
  const [revealed, setRevealed] = useState<string[]>([]);
  const [unmaskLog, setUnmaskLog] = useState<UnmaskEntry[]>([]);
  const [clientApproval, setClientApproval] = useState<ClientApproval | null>(null);
  const [efile, setEfile] = useState<EfileReceipt | null>(null);

  const current = staff.find((person) => person.id === staffId) ?? staff[0];

  function statusOf(code: string): ItemStatus {
    return statuses[code] ?? "open";
  }

  const value: WorkpaperContextValue = {
    staff,
    current,
    setStaffId,
    notes,
    addNote: (code, text) => {
      if (efile) return;
      const trimmed = text.trim();
      if (!trimmed || !current) return;
      const kind = current.role === "reviewer" ? "review" : "work";
      if (kind === "work" && current.role !== "preparer" && current.role !== "partner") return;
      setNotes((existing) => [
        {
          id: noteId(),
          code,
          text: trimmed,
          authorId: current.id,
          authorName: current.name,
          createdAt: new Date().toISOString(),
          kind,
          open: kind === "review",
        },
        ...existing,
      ]);
    },
    clearReviewNote: (id) => {
      if (efile) return;
      if (current?.role !== "reviewer") return;
      setNotes((existing) =>
        existing.map((note) => (note.id === id && note.kind === "review" ? { ...note, open: false } : note)),
      );
    },
    statuses,
    statusOf,
    setItemStatus: (code, status) => {
      if (efile) return;
      if (current?.role !== "preparer") return;
      setStatuses((existing) => ({ ...existing, [code]: status }));
    },
    adjustment,
    setAdjustment: (next) => {
      if (efile) return;
      if (current?.role !== "preparer") return;
      setAdjustmentState({ ...next, partnerApprovedBy: null });
    },
    approveAdjustment: () => {
      if (efile) return;
      if (current?.role !== "partner") return;
      setAdjustmentState((existing) =>
        existing && existing.needsPartner ? { ...existing, partnerApprovedBy: current.id } : existing,
      );
    },
    dueDiligence,
    setDueDiligence: (key, checked) => {
      if (efile) return;
      if (current?.role !== "preparer") return;
      setDueDiligenceState((prev) => {
        const next = { ...prev, [key]: checked };
        const complete = next.child && next.otherDependent && next.form8867;
        setStatuses((existing) => ({
          ...existing,
          DUE_DILIGENCE_REQUIRED: complete ? "resolved" : "open",
        }));
        return next;
      });
    },
    lowConfidence,
    setLowConfidence: (decision) => {
      if (efile) return;
      if (current?.role !== "preparer") return;
      setLowConfidenceState(decision);
      setStatuses((existing) => ({ ...existing, LOW_CONFIDENCE_READ: "resolved" }));
    },
    manualSteps,
    setManualStep: (step, done) => {
      if (efile) return;
      if (current?.role !== "preparer") return;
      setManualSteps((existing) => ({ ...existing, [step]: done }));
    },
    preparerSignoff,
    reviewerSignoff,
    partnerSignoff,
    signPreparer: () => {
      if (efile) return;
      if (current?.role !== "preparer") return;
      setPreparerSignoff({ staffId: current.id, at: new Date().toISOString() });
    },
    signReviewer: () => {
      if (efile) return false;
      if (current?.role !== "reviewer") return false;
      if (preparerSignoff?.staffId === current.id) return false;
      const openWarnings = warningCodes.some((code) => (statuses[code] ?? "open") === "open");
      if (openWarnings) return false;
      if (notes.some((note) => note.kind === "review" && note.open)) return false;
      setReviewerSignoff({ staffId: current.id, at: new Date().toISOString() });
      return true;
    },
    signPartner: () => {
      if (efile) return false;
      if (current?.role !== "partner" || !reviewerSignoff) return false;
      setPartnerSignoff({ staffId: current.id, at: new Date().toISOString() });
      return true;
    },
    revealed,
    unmaskLog,
    canSee: (key) => Boolean(current?.clearance) && revealed.includes(key),
    clientApproval,
    efile,
    approveClient: () => {
      if (efile || clientApproval) return;
      setClientApproval({ name: "Ngozi Okafor", at: new Date().toISOString() });
    },
    fileReturn: () => {
      if (!clientApproval || efile) return;
      const suffix = Math.floor(100000 + Math.random() * 900000);
      setEfile({ acknowledgment: `MF-2025-${suffix}`, at: new Date().toISOString() });
    },
    reveal: (key, label) => {
      if (!current?.clearance || revealed.includes(key)) return;
      setRevealed((existing) => [...existing, key]);
      setUnmaskLog((existing) => [
        ...existing,
        {
          key,
          staffId: current.id,
          staffName: current.name,
          label,
          at: new Date().toISOString(),
        },
      ]);
    },
  };

  return <WorkpaperContext.Provider value={value}>{children}</WorkpaperContext.Provider>;
}

export function useWorkpaper(): WorkpaperContextValue {
  const value = useContext(WorkpaperContext);
  if (!value) {
    throw new Error("useWorkpaper must be used within WorkpaperProvider");
  }
  return value;
}
