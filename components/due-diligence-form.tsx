"use client";

import { ClipboardCheck } from "lucide-react";
import { useWorkpaper, type DueDiligenceChecks } from "@/lib/workpaper-store";
import { Card } from "@/components/ui";

const checks: Array<{ key: keyof DueDiligenceChecks; label: string }> = [
  {
    key: "child",
    label: "Qualifying child for the child tax credit (Theo) is documented: relationship, age, residency, and support.",
  },
  {
    key: "otherDependent",
    label: "Credit for other dependents (Ada) is documented.",
  },
  {
    key: "form8867",
    label: "Form 8867 questions are completed and kept in the file.",
  },
];

export function DueDiligenceForm() {
  const { dueDiligence, setDueDiligence, current, efile } = useWorkpaper();
  const locked = current.role !== "preparer" || Boolean(efile);

  return (
    <Card className="p-5">
      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
        <ClipboardCheck className="h-4 w-4 text-slate-400" aria-hidden />
        Form 8867 checklist
      </h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">
        The American opportunity credit phased out. This checklist covers the child tax credit and the credit for
        other dependents. Filing stays blocked until it is complete.
      </p>
      <ul className="mt-4 space-y-3">
        {checks.map((item) => (
          <li key={item.key}>
            <label className="flex items-start gap-3 text-sm leading-6 text-slate-800">
              <input
                type="checkbox"
                className="mt-1 size-4 accent-teal-800"
                checked={dueDiligence[item.key]}
                disabled={locked}
                onChange={(event) => setDueDiligence(item.key, event.target.checked)}
              />
              {item.label}
            </label>
          </li>
        ))}
      </ul>
    </Card>
  );
}
