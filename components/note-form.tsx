"use client";

import { FormEvent, useState } from "react";
import { Check, MessageSquare } from "lucide-react";
import { useWorkpaper } from "@/lib/workpaper-store";
import { Button, Card, Textarea } from "@/components/ui";

export function NoteForm({
  code,
  reviewFile = false,
}: {
  code: string | null;
  reviewFile?: boolean;
}) {
  const { notes, addNote, clearReviewNote, current, efile } = useWorkpaper();
  const [text, setText] = useState("");
  const visible = notes.filter((note) => (reviewFile ? note.code === null : note.code === code));
  const reviewerOnly = reviewFile && current.role !== "reviewer";

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!text.trim() || reviewerOnly) return;
    addNote(reviewFile ? null : code, text);
    setText("");
  }

  return (
    <Card className="p-5">
      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
        <MessageSquare className="h-4 w-4 text-slate-400" aria-hidden />
        {reviewFile ? "Review notes" : "Notes"}
      </h2>
      {reviewFile ? (
        <p className="mt-1 text-sm text-slate-600">An open review note blocks filing and reviewer sign-off.</p>
      ) : null}
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <label className="block text-sm text-slate-700" htmlFor={reviewFile ? "review-note" : `note-${code}`}>
          {current.role === "reviewer" ? "Add review note" : "Add note"}
        </label>
        <Textarea
          id={reviewFile ? "review-note" : `note-${code}`}
          value={text}
          onChange={(event) => setText(event.target.value)}
          disabled={reviewerOnly || Boolean(efile)}
          placeholder={
            reviewFile
              ? "What still has to be cleared before sign-off?"
              : "What should the file remember about this item?"
          }
        />
        <Button type="submit" disabled={reviewerOnly || Boolean(efile)}>
          <MessageSquare className="h-4 w-4" aria-hidden />
          {current.role === "reviewer" ? "Add review note" : "Add note"}
        </Button>
        {efile ? (
          <p className="text-sm text-slate-500">Return filed — locked</p>
        ) : reviewerOnly ? (
          <p className="text-sm text-slate-500">Review notes are added by the reviewer.</p>
        ) : null}
      </form>
      {visible.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No notes yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {visible.map((note) => (
            <li key={note.id} className="rounded-lg bg-slate-50 px-3 py-3">
              <p className="text-xs text-slate-500">
                {note.kind === "review" ? "Review note" : "Note"} · {note.authorName} ·{" "}
                {new Date(note.createdAt).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
                {note.kind === "review" && note.open ? " · open" : ""}
                {note.kind === "review" && !note.open ? " · cleared" : ""}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-800">{note.text}</p>
              {note.kind === "review" && note.open && current.role === "reviewer" && !efile ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-2"
                  onClick={() => clearReviewNote(note.id)}
                >
                  <Check className="h-4 w-4" aria-hidden />
                  Clear note
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
