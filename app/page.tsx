import { FilingBanner } from "@/components/filing-banner";
import { IdentityCard } from "@/components/identity-card";
import { OpenItemsList } from "@/components/open-items-list";
import { SummaryCards } from "@/components/summary-cards";
import { formatComputedAt } from "@/lib/format";
import { getDiagnostics, getHousehold, getV3 } from "@/lib/packet";

export default function DashboardPage() {
  const version = getV3();
  const diagnostics = getDiagnostics();
  const household = getHousehold();

  return (
    <div className="space-y-8">
      <FilingBanner diagnostics={diagnostics} />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Return summary</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
          Federal totals from return version v3, computed {formatComputedAt(version.computed_at)}.
        </p>
      </div>
      <SummaryCards summary={version.summary.federal} />
      <IdentityCard people={household.people} bank={household.bank} />
      <OpenItemsList items={diagnostics} />
    </div>
  );
}
