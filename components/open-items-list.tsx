"use client";

import Link from "next/link";
import { AlertTriangle, ChevronRight, Info, ListChecks } from "lucide-react";
import type { Diagnostic } from "@/lib/types";
import { useWorkpaper } from "@/lib/workpaper-store";
import { Badge } from "@/components/ui";

export function OpenItemsList({ items }: { items: Diagnostic[] }) {
  const { statusOf } = useWorkpaper();

  return (
    <section>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-900">
          <ListChecks className="h-4 w-4 text-slate-400" aria-hidden />
          Open items
        </h2>
        <p className="text-sm text-slate-500">{items.length} diagnostics</p>
      </div>
      {items.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
          No diagnostics on this return.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {items.map((item) => {
            const status = statusOf(item.code);
            const warning = item.severity === "warning";
            const StatusIcon = warning ? AlertTriangle : Info;
            return (
              <li key={item.code}>
                <Link
                  href={`/open-items/${item.code}`}
                  className="group flex items-start gap-3 px-4 py-4 transition duration-150 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-teal-800"
                >
                  <StatusIcon
                    className={`mt-0.5 h-4 w-4 shrink-0 ${warning ? "text-amber-600" : "text-sky-600"}`}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <Badge tone={warning ? "warning" : "info"} className="capitalize">
                        {item.severity}
                      </Badge>
                      <span className="font-mono text-xs text-slate-500">{item.code}</span>
                      <Badge
                        tone={status === "open" ? "neutral" : "success"}
                        className="ml-auto capitalize"
                      >
                        {status}
                      </Badge>
                    </span>
                    <span className="mt-2 block text-sm leading-6 text-slate-800">{item.message}</span>
                  </span>
                  <ChevronRight
                    className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition duration-150 group-hover:translate-x-0.5 group-hover:text-slate-500"
                    aria-hidden
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
