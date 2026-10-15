"use client";

import Link from "next/link";
import { ClipboardCheck, Scale, Send, UserRound } from "lucide-react";
import { useWorkpaper } from "@/lib/workpaper-store";
import { Badge, Select } from "@/components/ui";

export function Header() {
  const { staff, current, setStaffId } = useWorkpaper();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Scale className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">MiraFlores</p>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <Link
                href="/"
                className="text-lg font-semibold tracking-tight text-slate-900 transition-colors hover:text-teal-800"
              >
                Okafor-Lindqvist 2025
              </Link>
              <Badge>v3</Badge>
              <Link
                href="/review"
                className="inline-flex items-center gap-1 text-sm font-medium text-teal-800 transition-colors hover:text-teal-950"
              >
                <ClipboardCheck className="h-3.5 w-3.5" aria-hidden />
                Review
              </Link>
              <Link
                href="/client"
                className="inline-flex items-center gap-1 text-sm font-medium text-teal-800 transition-colors hover:text-teal-950"
              >
                <Send className="h-3.5 w-3.5" aria-hidden />
                Client
              </Link>
            </div>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <UserRound className="h-4 w-4 text-slate-500" aria-hidden />
          Working as
          <Select
            aria-label="Working as"
            value={current.id}
            onChange={(event) => setStaffId(event.target.value)}
          >
            {staff.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name} — {person.role}
              </option>
            ))}
          </Select>
        </label>
      </div>
    </header>
  );
}
