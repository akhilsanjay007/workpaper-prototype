import { EfilePanel, FilingStepper } from "@/components/filing-status";
import { FilingBanner } from "@/components/filing-banner";
import { ReviewBoard } from "@/components/review-board";
import { getDiagnostics, getEngagementEventId, getRequiredSteps } from "@/lib/packet";

export default function ReviewPage() {
  const diagnostics = getDiagnostics();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Review and sign-off</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
          Filing stays blocked until warnings, due diligence, review notes, and the three sign-offs are clear.
        </p>
      </div>
      <FilingBanner diagnostics={diagnostics} />
      <FilingStepper diagnostics={diagnostics} />
      <EfilePanel diagnostics={diagnostics} />
      <ReviewBoard
        diagnostics={diagnostics}
        steps={getRequiredSteps()}
        engagementEventId={getEngagementEventId()}
      />
    </div>
  );
}
