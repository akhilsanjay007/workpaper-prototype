"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, FileCheck, Lock } from "lucide-react";
import { formatStamp, useFilingProgress } from "@/components/filing-status";
import type { Diagnostic } from "@/lib/types";

export function FilingBanner({ diagnostics }: { diagnostics: Diagnostic[] }) {
  const { blockers, ready, approved, store } = useFilingProgress(diagnostics);

  if (store.efile) {
    return (
      <div className="flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 shadow-sm">
        <FileCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
        <div>
          <p className="text-sm font-semibold text-emerald-950">E-filed successfully</p>
          <p className="mt-1 text-sm text-emerald-800">
            Acknowledgment {store.efile.acknowledgment} · {formatStamp(store.efile.at)}
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-emerald-950">
            <Lock className="h-4 w-4" aria-hidden />
            Return filed — locked
          </p>
        </div>
      </div>
    );
  }

  if (ready && approved && store.clientApproval) {
    return (
      <div className="flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 shadow-sm">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
        <div>
          <p className="text-sm font-semibold text-emerald-950">Client approved — ready to e-file</p>
          <p className="mt-1 text-sm text-emerald-800">
            {store.clientApproval.name} approved this return · {formatStamp(store.clientApproval.at)}
          </p>
        </div>
      </div>
    );
  }

  if (ready) {
    return (
      <div className="flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 shadow-sm">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
        <div>
          <p className="text-sm font-semibold text-emerald-950">Ready for client approval</p>
          <p className="mt-1 text-sm text-emerald-800">
            Warnings are cleared, review notes are closed, and preparer, reviewer, and partner have signed.
          </p>
          <Link href="/client" className="mt-2 inline-block text-sm font-medium text-teal-800 hover:text-teal-950">
            Open client approval
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-rose-950">
          <AlertTriangle className="h-4 w-4 text-rose-600" aria-hidden />
          Filing blocked
        </p>
        <Link href="/review" className="text-sm font-medium text-teal-800 transition-colors hover:text-teal-950">
          Open review
        </Link>
      </div>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-rose-950">
        {blockers.map((blocker) => (
          <li key={blocker}>{blocker}</li>
        ))}
      </ul>
    </div>
  );
}
