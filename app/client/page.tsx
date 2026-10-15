import { ClientApproval } from "@/components/client-approval";
import { getDiagnostics, getV3 } from "@/lib/packet";

export default function ClientPage() {
  const version = getV3();

  return (
    <ClientApproval
      taxYear={2025}
      balanceDue={version.summary.federal.balance_due}
      diagnostics={getDiagnostics()}
    />
  );
}
