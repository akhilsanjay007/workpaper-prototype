"use client";

import { useState } from "react";
import { Copy, Eye } from "lucide-react";
import { maskText } from "@/lib/sensitive";
import type { SensitiveSecrets } from "@/lib/types";
import { useWorkpaper } from "@/lib/workpaper-store";
import { Button } from "@/components/ui";

export function DocumentBody({
  documentId,
  printed,
  secrets,
}: {
  documentId: string;
  printed: string;
  secrets: SensitiveSecrets;
}) {
  const { canSee, reveal, current } = useWorkpaper();
  const key = `document:${documentId}`;
  const visible = canSee(key);
  const text = visible ? printed : maskText(printed, secrets);
  const [copied, setCopied] = useState(false);

  async function copyText() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">Printed content</h2>
        <div className="flex flex-wrap items-center gap-2">
          {current.clearance && !visible ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => reveal(key, `printed content of ${documentId}`)}
            >
              <Eye className="h-4 w-4" aria-hidden />
              Reveal sensitive values
            </Button>
          ) : null}
          <Button type="button" variant="secondary" onClick={copyText}>
            <Copy className="h-4 w-4" aria-hidden />
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>
      <p className="mt-3 whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-[13px] leading-6 text-slate-800">
        {text}
      </p>
    </article>
  );
}
