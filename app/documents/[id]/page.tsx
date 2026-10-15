import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { DocumentBody } from "@/components/document-body";
import { Badge } from "@/components/ui";
import { getDocument, getHousehold } from "@/lib/packet";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const document = getDocument(id);

  if (!document) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Document not found</h1>
        <p className="mt-2 text-sm text-slate-500">No document matches {id}.</p>
        <Link href="/" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-teal-800 transition-colors hover:text-teal-950">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to dashboard
        </Link>
      </div>
    );
  }

  const printed = document.pages[0]?.printed_content ?? "";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <Link
          href="/open-items/DIGITAL_ASSET_BASIS_MISSING"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-800 transition-colors hover:text-teal-950"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to crypto basis open item
        </Link>
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-800 transition-colors hover:text-teal-950">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Dashboard
        </Link>
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{document.document_type}</Badge>
          <span className="font-mono text-xs text-slate-500">{document.id}</span>
        </div>
        <div className="mt-2 flex items-start gap-3">
          <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <FileText className="h-4 w-4" aria-hidden />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{document.title}</h1>
        </div>
      </div>
      <DocumentBody documentId={document.id} printed={printed} secrets={getHousehold().secrets} />
    </div>
  );
}
