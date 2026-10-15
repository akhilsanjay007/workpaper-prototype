"use client";

import Link from "next/link";
import { Check, Send } from "lucide-react";
import { FilingBanner } from "@/components/filing-banner";
import { EfilePanel, FilingStepper, formatStamp, useFilingProgress } from "@/components/filing-status";
import { Button, Card } from "@/components/ui";
import { formatMoney } from "@/lib/format";
import type { Diagnostic } from "@/lib/types";

export function ClientApproval({
  taxYear,
  balanceDue,
  diagnostics,
}: {
  taxYear: number;
  balanceDue: number;
  diagnostics: Diagnostic[];
}) {
  const { ready, store } = useFilingProgress(diagnostics);
  const approval = store.clientApproval;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Client approval</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
          Ngozi Okafor reviews the finished return and approves it before e-file.
        </p>
      </div>
      <FilingBanner diagnostics={diagnostics} />
      <FilingStepper diagnostics={diagnostics} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Tax year</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{taxYear}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Balance due</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums text-slate-900">
            {formatMoney(balanceDue)}
          </p>
        </Card>
      </div>
      <Card className="p-5">
        <h2 className="text-base font-semibold text-slate-900">Questions for you</h2>
        <p className="mt-2 text-sm text-slate-600">No open questions</p>
      </Card>
      {approval ? (
        <div className="flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 shadow-sm">
          <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-emerald-950">Return approved</p>
            <p className="mt-1 text-sm text-emerald-800">
              Approved by {approval.name} · {formatStamp(approval.at)}
            </p>
          </div>
        </div>
      ) : ready ? (
        <Card className="p-5">
          <p className="text-sm font-semibold text-slate-900">Ready for your approval</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            The preparer, reviewer, and partner have signed. Approve the return to open e-file.
          </p>
          <Button type="button" className="mt-4" onClick={store.approveClient}>
            <Send className="h-4 w-4" aria-hidden />
            Approve return
          </Button>
        </Card>
      ) : (
        <Card className="p-5">
          <p className="text-sm text-slate-700">This return is not ready for client approval yet.</p>
          <Link href="/review" className="mt-3 inline-block text-sm font-medium text-teal-800 hover:text-teal-950">
            Open review
          </Link>
        </Card>
      )}
      <EfilePanel diagnostics={diagnostics} />
    </div>
  );
}
