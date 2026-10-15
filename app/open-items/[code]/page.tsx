import Link from "next/link";
import { ArrowLeft, FileSearch, Scale } from "lucide-react";
import { AgentAssist } from "@/components/agent-assist";
import { BasisAdjustForm } from "@/components/basis-adjust-form";
import { DueDiligenceForm } from "@/components/due-diligence-form";
import { ItemActions } from "@/components/item-actions";
import { LowConfidenceForm } from "@/components/low-confidence-form";
import { NoteForm } from "@/components/note-form";
import { ProvenancePanel, type ProvenanceRow } from "@/components/provenance-panel";
import { QuestionnaireConflict } from "@/components/questionnaire-conflict";
import { Badge, Card } from "@/components/ui";
import { formatExtractedValue, formatMoney } from "@/lib/format";
import { getDiagnostics, getExtractedValue, getLine, getQuestionnaireAnswer, getV3 } from "@/lib/packet";

const CRYPTO_CODE = "DIGITAL_ASSET_BASIS_MISSING";
const CRYPTO_LINE = "F8949.H.C6";
const CRYPTO_GAIN = 5325;

function provenanceRows(refs: string[]): ProvenanceRow[] {
  return refs.flatMap((ref) => {
    const value = getExtractedValue(ref);
    if (!value) return [];
    const textAsRead =
      (value.value === null || value.value === "") && value.text_as_read ? value.text_as_read : "";
    return [
      {
        id: value.id,
        field: value.field,
        label: value.label,
        displayValue: formatExtractedValue(value),
        textAsRead,
        confidence: value.confidence,
        documentId: value.document_id,
      },
    ];
  });
}

export default async function OpenItemPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const diagnostic = getDiagnostics().find((item) => item.code === code);

  if (!diagnostic) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Open item not found</h1>
        <p className="mt-2 text-sm text-slate-500">No diagnostic matches this code.</p>
        <Link href="/" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-teal-800 transition-colors hover:text-teal-950">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to dashboard
        </Link>
      </div>
    );
  }

  const isCrypto = diagnostic.code === CRYPTO_CODE;
  const isDiligence = diagnostic.code === "DUE_DILIGENCE_REQUIRED";
  const isQuestionnaire = diagnostic.code === "QUESTIONNAIRE_SALES_CONFLICT";
  const isLowConfidence = diagnostic.code === "LOW_CONFIDENCE_READ";
  const line = isCrypto ? getLine(CRYPTO_LINE) : undefined;
  const gain = typeof line?.value === "number" ? line.value : CRYPTO_GAIN;
  const rows = provenanceRows(diagnostic.refs);
  const questionnaire = isQuestionnaire ? getQuestionnaireAnswer("qa-14") : undefined;
  const gift = isLowConfidence ? getExtractedValue("ev-1049") : undefined;
  const rates = getV3().tax_effect_rates;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-800 transition-colors hover:text-teal-950">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to dashboard
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge tone={diagnostic.severity} className="capitalize">
            {diagnostic.severity}
          </Badge>
          <span className="font-mono text-xs text-slate-500">{diagnostic.code}</span>
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">Open item</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-800">{diagnostic.message}</p>
      </div>

      {isCrypto ? (
        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-900">
            <Scale className="h-4 w-4 text-slate-400" aria-hidden />
            Current treatment
          </h2>
          <Card className="mt-3 p-5">
            <p className="font-mono text-xs text-slate-500">{CRYPTO_LINE}</p>
            <p className="mt-2 text-sm leading-6 text-slate-800">
              {line?.label ?? "BTC lot C6, basis 0.00, gain 5,325.00"}
            </p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Basis</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums">{formatMoney(0)}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Gain</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums">{formatMoney(gain)}</dd>
              </div>
            </dl>
          </Card>
        </section>
      ) : null}

      {rows.length > 0 ? (
        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-900">
            <FileSearch className="h-4 w-4 text-slate-400" aria-hidden />
            Provenance
          </h2>
          <div className="mt-3">
            <ProvenancePanel rows={rows} />
          </div>
        </section>
      ) : null}

      {isDiligence ? <DueDiligenceForm /> : null}
      {questionnaire ? <QuestionnaireConflict answer={questionnaire} /> : null}
      {gift && typeof gift.value === "number" ? (
        <LowConfidenceForm documentId={gift.document_id} readAmount={gift.value} />
      ) : null}

      <AgentAssist code={diagnostic.code} />

      <div className="grid gap-6 lg:grid-cols-2">
        <NoteForm code={diagnostic.code} />
        {isCrypto ? (
          <BasisAdjustForm
            federalPerDollar={rates.stcg.federal_per_dollar}
            californiaPerDollar={rates.ca_source_income.california_per_dollar}
          />
        ) : null}
      </div>

      {isDiligence || isLowConfidence ? null : (
        <ItemActions
          code={diagnostic.code}
          severity={diagnostic.severity}
          gate={isCrypto ? "adjustment" : isQuestionnaire ? "note" : "none"}
        />
      )}
    </div>
  );
}
