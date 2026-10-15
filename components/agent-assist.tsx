"use client";

import { useState } from "react";
import { MessageSquare, Sparkles } from "lucide-react";
import { useWorkpaper } from "@/lib/workpaper-store";
import { Button, Card } from "@/components/ui";

type AgentAction = "explain" | "question";

const DRAFTS: Record<string, Record<AgentAction, string>> = {
  DIGITAL_ASSET_BASIS_MISSING: {
    explain:
      "Coinhaven lot C6 (0.05 BTC) sold 2025-06-18 for $5,325. 1099-DA reports proceeds but no basis. CSV shows transfer-in on 2025-06-01 with “cost basis unknown.” Engine used $0 basis so full proceeds are currently gain. Client needs to provide cost basis from the external wallet.",
    question:
      "Hi, for the 0.05 BTC sold on Coinhaven on June 18, 2025 (lot C6), our records show it was transferred in on June 1 with no cost basis. Could you share the original purchase records or wallet history so we can report the correct basis?",
  },
  QUESTIONNAIRE_SALES_CONFLICT: {
    explain:
      "Client answered “No” to investments sold, but documents show brokerage sales and digital asset dispositions. Documents control; questionnaire answer should be updated or noted.",
    question:
      "Hi, the questionnaire says you did not sell investments in 2025, but the 1099s show brokerage sales and digital asset dispositions. Could you confirm those sales should be reported?",
  },
  AMT_CREDIT_CARRYFORWARD: {
    explain:
      "Alternative minimum tax comes from the incentive stock option exercise, which is a deferral item. A minimum tax credit carryforward to 2026 is expected on Form 8801 next year. This is an information item and does not block filing.",
    question:
      "We expect a minimum tax credit next year from the incentive stock option exercise. Could you confirm there were no other option exercises in 2025?",
  },
  AOTC_PHASED_OUT: {
    explain:
      "The American opportunity credit is fully phased out by modified AGI. No credit is claimed. This is an information item and does not block filing.",
    question:
      "The American opportunity credit phased out because of income on this return. Please let us know if that does not match what you expected.",
  },
  FBAR_OUTSIDE_RETURN: {
    explain:
      "The foreign account maximum is over $10,000, so FinCEN Form 114 (FBAR) is due separately. It is not part of this return and not in the engagement. This is an information item and does not block filing.",
    question:
      "Your foreign account balance is over $10,000, so the FBAR is filed separately and is outside this engagement. Could you confirm you will file FinCEN Form 114 on your own?",
  },
  FORM_1099_FILING: {
    explain:
      "Schedule C shows the client paid two contractors $600 or more and has not filed Forms 1099-NEC. Those forms still need to be filed or documented before this warning is cleared.",
    question:
      "Schedule C shows two contractors paid $600 or more, and Forms 1099-NEC are not in the file. Could you send those forms, or confirm they still need to be filed?",
  },
  DUE_DILIGENCE_REQUIRED: {
    explain:
      "Form 8867 must be completed for the child tax credit and the credit for other dependents. The checklist covers Theo and Ada. Filing stays blocked until those questions are documented.",
    question:
      "We still need to document the child tax credit for Theo and the credit for other dependents for Ada. Could you confirm each child’s relationship, age, and that they lived with you?",
  },
  CA_AMT_NOT_COMPUTED: {
    explain:
      "California AMT on Schedule P (540NR) has not been computed. The incentive stock option exercise still needs a California-source allocation before this warning is cleared.",
    question:
      "California alternative minimum tax is not computed yet because of the incentive stock option exercise. Could you confirm how much of that exercise relates to California work?",
  },
  HOME_OFFICE_AREA_CHANGE: {
    explain:
      "The home office area averages 240 square feet, down from 300 square feet in 2024. This is an information item and does not block filing.",
    question:
      "The home office is 240 square feet this year, compared with 300 square feet in 2024. Could you confirm the current office area?",
  },
  LOW_CONFIDENCE_READ: {
    explain:
      "A handwritten receipt for a cash gift was read as $1,500 at confidence 0.41. Confirm or correct that amount before resolving the warning.",
    question:
      "A handwritten receipt was read as a $1,500 cash gift, and the handwriting is uncertain. Could you confirm that amount?",
  },
  BROKER_SUMMARY_DETAIL_MISMATCH: {
    explain:
      "The Meridian 1099-B summary shows proceeds of $71,965.00. The extracted lots add to $71,715.00. The $250 difference should be tied out before this warning is cleared.",
    question:
      "The Meridian 1099-B summary shows proceeds of $71,965, and the individual lots add to $71,715. Could you confirm which total we should use?",
  },
};

const GENERIC: Record<AgentAction, string> = {
  explain:
    "This open item still needs a preparer review of the diagnostic and its source documents. Confirm what is missing before resolving it.",
  question: "Could you confirm the detail we still need to clear this item on your return?",
};

export function AgentAssist({ code }: { code: string }) {
  const { addNote, efile } = useWorkpaper();
  const [draft, setDraft] = useState<string | null>(null);

  function useAsNote() {
    if (!draft || efile) return;
    addNote(code, draft);
    setDraft(null);
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={() => setDraft((DRAFTS[code] ?? GENERIC).explain)}>
          <Sparkles className="h-4 w-4" aria-hidden />
          Explain this issue
        </Button>
        <Button type="button" variant="secondary" onClick={() => setDraft((DRAFTS[code] ?? GENERIC).question)}>
          <MessageSquare className="h-4 w-4" aria-hidden />
          Draft client question
        </Button>
      </div>
      {draft ? (
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            AI-assisted draft — review before saving
          </p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-800">{draft}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" disabled={Boolean(efile)} onClick={useAsNote}>
              Use as note
            </Button>
            <Button type="button" variant="secondary" onClick={() => setDraft(null)}>
              Dismiss
            </Button>
          </div>
          {efile ? <p className="mt-3 text-sm text-slate-500">Return filed — locked</p> : null}
        </Card>
      ) : null}
    </section>
  );
}
