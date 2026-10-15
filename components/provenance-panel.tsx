import Link from "next/link";
import { FileText, Link2 } from "lucide-react";
import { Badge } from "@/components/ui";

export type ProvenanceRow = {
  id: string;
  field: string;
  label: string;
  displayValue: string;
  textAsRead: string;
  confidence: number;
  documentId: string;
};

export function ProvenancePanel({ rows }: { rows: ProvenanceRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-sm text-slate-500">
        No extracted values are linked to this item.
      </p>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {rows.map((row) => (
        <li key={row.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              <div>
                <div className="text-sm font-medium text-slate-900">{row.label}</div>
                <div className="mt-1 font-mono text-xs text-slate-500">
                  {row.id} · {row.field}
                </div>
              </div>
            </div>
            <Badge tone={row.confidence < 0.8 ? "warning" : "neutral"}>{row.confidence.toFixed(2)}</Badge>
          </div>
          <p className="mt-3 text-sm text-slate-800">{row.displayValue}</p>
          {row.textAsRead ? <p className="mt-1 text-xs text-slate-500">As read: {row.textAsRead}</p> : null}
          <Link
            href={`/documents/${row.documentId}`}
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-teal-800 transition-colors hover:text-teal-950"
          >
            <Link2 className="h-3.5 w-3.5" aria-hidden />
            {row.documentId}
          </Link>
        </li>
      ))}
    </ul>
  );
}
