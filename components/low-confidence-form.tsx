"use client";

import { FormEvent, useState } from "react";
import { Check, ScanSearch } from "lucide-react";
import Link from "next/link";
import { formatMoney } from "@/lib/format";
import { useWorkpaper } from "@/lib/workpaper-store";
import { Button, Card, Input } from "@/components/ui";

export function LowConfidenceForm({
  documentId,
  readAmount,
}: {
  documentId: string;
  readAmount: number;
}) {
  const { current, lowConfidence, setLowConfidence, efile } = useWorkpaper();
  const [amount, setAmount] = useState(String(readAmount));
  const [error, setError] = useState("");
  const canPrepare = current.role === "preparer" && !efile;

  function correct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = Number(amount);
    if (!Number.isFinite(next) || next < 0) {
      setError("Enter an amount of zero or more.");
      return;
    }
    setError("");
    setLowConfidence({ decision: "correct", amount: next });
  }

  return (
    <Card className="p-5">
      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
        <ScanSearch className="h-4 w-4 text-amber-600" aria-hidden />
        Low-confidence amount
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-700">
        Cash gift read as {formatMoney(readAmount)} at confidence 0.41.{" "}
        <Link href={`/documents/${documentId}`} className="font-medium text-teal-800">
          Open {documentId}
        </Link>
      </p>
      {lowConfidence ? (
        <p className="mt-3 text-sm text-slate-800">
          {lowConfidence.decision === "confirm" ? "Confirmed" : "Corrected to"} {formatMoney(lowConfidence.amount)}.
        </p>
      ) : canPrepare ? (
        <div className="mt-4 space-y-3">
          <Button type="button" onClick={() => setLowConfidence({ decision: "confirm", amount: readAmount })}>
            <Check className="h-4 w-4" aria-hidden />
            Confirm {formatMoney(readAmount)}
          </Button>
          <form onSubmit={correct} className="flex flex-wrap items-end gap-2">
            <div>
              <label className="mb-1 block text-sm text-slate-700" htmlFor="corrected-amount">
                Corrected amount
              </label>
              <Input
                id="corrected-amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </div>
            <Button type="submit" variant="secondary">
              Save correction
            </Button>
          </form>
          {error ? <p className="text-sm text-amber-800">{error}</p> : null}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-600">Only a preparer can confirm or correct this amount.</p>
      )}
    </Card>
  );
}
