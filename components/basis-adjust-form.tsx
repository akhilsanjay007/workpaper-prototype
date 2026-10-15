"use client";

import { FormEvent, useState } from "react";
import { Check, Lock, Pencil } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { CRYPTO_GAIN, PARTNER_TAX_THRESHOLD, cryptoTaxEffect } from "@/lib/tax-effect";
import { useWorkpaper } from "@/lib/workpaper-store";
import { Button, Card, Input, Textarea } from "@/components/ui";

export function BasisAdjustForm({
  federalPerDollar,
  californiaPerDollar,
}: {
  federalPerDollar: number;
  californiaPerDollar: number;
}) {
  const { adjustment, setAdjustment, approveAdjustment, current, staff, efile } = useWorkpaper();
  const [basis, setBasis] = useState(adjustment ? String(adjustment.newBasis) : "");
  const [reason, setReason] = useState(adjustment?.reason ?? "");
  const [authority, setAuthority] = useState(adjustment?.authority ?? "");
  const [error, setError] = useState("");
  const canPrepare = current.role === "preparer" && !efile;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const newBasis = Number(basis);
    if (!Number.isFinite(newBasis) || newBasis < 0) {
      setError("Enter a basis of zero or more.");
      return;
    }
    if (!reason.trim()) {
      setError("Add a reason for the adjustment.");
      return;
    }
    if (!authority.trim()) {
      setError("Record the authority this judgment relies on.");
      return;
    }
    setError("");
    const effect = cryptoTaxEffect(newBasis, federalPerDollar, californiaPerDollar);
    setAdjustment({
      newBasis,
      reason: reason.trim(),
      authority: authority.trim(),
      partnerApprovedBy: null,
      ...effect,
    });
  }

  const approver = staff.find((person) => person.id === adjustment?.partnerApprovedBy);

  return (
    <Card className="p-5">
      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
        <Pencil className="h-4 w-4 text-slate-400" aria-hidden />
        Adjust basis
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        New gain = {formatMoney(CRYPTO_GAIN)} − new basis. Federal tax uses the short-term rate (
        {federalPerDollar}) and California uses the full-source rate ({californiaPerDollar}).
      </p>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <div>
          <label className="mb-1 block text-sm text-slate-700" htmlFor="basis">
            New basis
          </label>
          <Input
            id="basis"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={basis}
            disabled={!canPrepare}
            onChange={(event) => setBasis(event.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-700" htmlFor="reason">
            Reason
          </label>
          <Textarea
            id="reason"
            value={reason}
            disabled={!canPrepare}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Where did the replacement basis come from?"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-700" htmlFor="authority">
            Authority
          </label>
          <Input
            id="authority"
            value={authority}
            disabled={!canPrepare}
            onChange={(event) => setAuthority(event.target.value)}
            placeholder="Client records, reg., or other authority"
          />
        </div>
        {error ? <p className="text-sm text-amber-800">{error}</p> : null}
        <Button type="submit" disabled={!canPrepare}>
          <Pencil className="h-4 w-4" aria-hidden />
          Apply adjustment
        </Button>
        {efile ? (
          <p className="flex items-center gap-1.5 text-sm text-slate-600">
            <Lock className="h-4 w-4" aria-hidden />
            Return filed — locked
          </p>
        ) : null}
      </form>
      {adjustment ? (
        <div className="mt-5 space-y-3">
          <dl className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-slate-50 p-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Old gain</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums text-slate-900">
                {formatMoney(CRYPTO_GAIN)}
              </dd>
            </div>
            <div className="rounded-lg bg-teal-50 p-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-teal-800">New gain</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums text-teal-950">
                {formatMoney(adjustment.newGain)}
              </dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Federal tax</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums">{formatMoney(adjustment.federalTaxChange)}</dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">California tax</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums">
                {formatMoney(adjustment.californiaTaxChange)}
              </dd>
            </div>
          </dl>
          <p className="text-sm leading-6 text-slate-600">
            Basis {formatMoney(adjustment.newBasis)}. {adjustment.reason} Authority: {adjustment.authority}
          </p>
          {adjustment.needsPartner ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-950">
              <p>
                Tax effect exceeds {formatMoney(PARTNER_TAX_THRESHOLD)}. Partner approval is required.
              </p>
              {approver ? (
                <p className="mt-1">Approved by {approver.name}.</p>
              ) : current.role === "partner" && !efile ? (
                <Button type="button" className="mt-2" onClick={approveAdjustment}>
                  <Check className="h-4 w-4" aria-hidden />
                  Approve adjustment
                </Button>
              ) : (
                <p className="mt-1">Helen Strand has not approved this adjustment.</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              Tax effect is within the {formatMoney(PARTNER_TAX_THRESHOLD)} preparer limit.
            </p>
          )}
        </div>
      ) : null}
    </Card>
  );
}
