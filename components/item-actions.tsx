"use client";

import { Check } from "lucide-react";
import { useWorkpaper } from "@/lib/workpaper-store";
import { Badge, Button, Card } from "@/components/ui";

export function ItemActions({
  code,
  severity,
  gate = "none",
}: {
  code: string;
  severity: "info" | "warning";
  gate?: "none" | "note" | "adjustment";
}) {
  const { current, statusOf, setItemStatus, notes, adjustment, efile } = useWorkpaper();
  const status = statusOf(code);
  const isPreparer = current.role === "preparer";
  const hasNote = notes.some((note) => note.code === code && note.kind === "work" && note.text.trim());
  const canResolve = gate === "note" ? hasNote : gate === "adjustment" ? Boolean(adjustment) : true;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-900">Disposition</h2>
        <Badge tone={status === "open" ? "warning" : "success"} className="capitalize">
          {status}
        </Badge>
      </div>
      <p className="mt-1 text-sm capitalize text-slate-600">Status: {status}</p>
      {efile ? (
        <p className="mt-4 text-sm text-slate-600">Return filed — locked</p>
      ) : severity === "info" ? (
        <div className="mt-4">
          {status === "open" && isPreparer ? (
            <Button type="button" onClick={() => setItemStatus(code, "accepted")}>
              <Check className="h-4 w-4" aria-hidden />
              Acknowledge
            </Button>
          ) : (
            <p className="text-sm text-slate-600">Info items do not block filing.</p>
          )}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {isPreparer && status === "open" ? (
            <div className="flex flex-wrap gap-2">
              {gate !== "note" ? (
                <Button type="button" variant="secondary" onClick={() => setItemStatus(code, "accepted")}>
                  <Check className="h-4 w-4" aria-hidden />
                  Accept
                </Button>
              ) : null}
              <Button type="button" disabled={!canResolve} onClick={() => setItemStatus(code, "resolved")}>
                <Check className="h-4 w-4" aria-hidden />
                Resolve
              </Button>
            </div>
          ) : null}
          {!isPreparer ? <p className="text-sm text-slate-600">Only a preparer can resolve or accept this item.</p> : null}
          {isPreparer && status === "open" && gate === "note" && !hasNote ? (
            <p className="text-sm text-amber-800">Add a note that the documents control before resolving.</p>
          ) : null}
          {isPreparer && status === "open" && gate === "adjustment" && !adjustment ? (
            <p className="text-sm text-amber-800">Apply a basis adjustment, including the authority, before resolving.</p>
          ) : null}
        </div>
      )}
    </Card>
  );
}
