import { MessageSquareWarning } from "lucide-react";
import type { QuestionnaireAnswer } from "@/lib/types";
import { Card } from "@/components/ui";

export function QuestionnaireConflict({ answer }: { answer: QuestionnaireAnswer }) {
  return (
    <Card className="p-5">
      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
        <MessageSquareWarning className="h-4 w-4 text-amber-600" aria-hidden />
        Questionnaire answer
      </h2>
      <p className="mt-3 text-sm font-medium text-slate-900">{answer.question}</p>
      <p className="mt-2 text-sm leading-6 text-slate-800">
        {answer.answeredBy}: {answer.answer}
      </p>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        The return documents show 282 brokerage sales and 12 digital asset dispositions. Resolve this item only
        after a note records that the documents control.
      </p>
    </Card>
  );
}
