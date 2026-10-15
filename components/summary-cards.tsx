import { CreditCard, DollarSign, FileText, Scale, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatMoney } from "@/lib/format";
import type { FederalSummary } from "@/lib/types";
import { Card } from "@/components/ui";

const cards: Array<{ key: keyof FederalSummary; label: string; icon: LucideIcon }> = [
  { key: "agi", label: "AGI", icon: DollarSign },
  { key: "taxable_income", label: "Taxable income", icon: FileText },
  { key: "total_tax", label: "Total tax", icon: Scale },
  { key: "payments", label: "Payments", icon: CreditCard },
  { key: "balance_due", label: "Balance due", icon: Wallet },
];

export function SummaryCards({ summary }: { summary: FederalSummary }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => {
        const due = card.key === "balance_due" && summary.balance_due > 0;
        const Icon = card.icon;
        return (
          <Card key={card.key} className={due ? "border-rose-200 bg-rose-50 p-4" : "p-4"}>
            <div className="flex items-center justify-between gap-2">
              <p className={`text-xs font-medium uppercase tracking-wide ${due ? "text-rose-700" : "text-slate-500"}`}>
                {card.label}
              </p>
              <Icon className={`h-4 w-4 ${due ? "text-rose-600" : "text-slate-400"}`} aria-hidden />
            </div>
            <p className={`mt-3 text-xl font-semibold tabular-nums ${due ? "text-rose-950" : "text-slate-900"}`}>
              {formatMoney(summary[card.key])}
            </p>
          </Card>
        );
      })}
    </div>
  );
}
