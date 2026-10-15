"use client";

import Link from "next/link";
import { Eye, Shield } from "lucide-react";
import { maskAccount, maskPin, maskSsn } from "@/lib/sensitive";
import type { HouseholdView } from "@/lib/types";
import { useWorkpaper } from "@/lib/workpaper-store";
import { Button, Card } from "@/components/ui";

function SecretValue({
  revealKey,
  label,
  value,
  masked,
}: {
  revealKey: string;
  label: string;
  value: string;
  masked: string;
}) {
  const { canSee, reveal, current } = useWorkpaper();
  const visible = canSee(revealKey);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
        <dd className="mt-1 font-mono text-sm text-slate-900">{visible ? value : masked}</dd>
      </div>
      {current.clearance && !visible ? (
        <Button type="button" variant="secondary" onClick={() => reveal(revealKey, label)}>
          <Eye className="h-4 w-4" aria-hidden />
          Reveal
        </Button>
      ) : null}
    </div>
  );
}

export function IdentityCard({
  people,
  bank,
}: {
  people: HouseholdView["people"];
  bank: HouseholdView["bank"];
}) {
  return (
    <Card className="p-5">
      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
        <Shield className="h-4 w-4 text-slate-400" aria-hidden />
        Client identity
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Staff without sensitive-data clearance see these values masked. A reveal is written to the review log.{" "}
        <Link href="/documents/D08" className="font-medium text-teal-800">
          Corvane W-2 (D08)
        </Link>{" "}
        includes Ngozi&apos;s SSN.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {people.map((person) => (
          <div key={person.id} className="space-y-3 rounded-lg bg-slate-50 p-3">
            <p className="text-sm font-medium text-slate-900">
              {person.name}{" "}
              <span className="font-normal text-slate-500">{person.role}</span>
            </p>
            <dl className="space-y-3">
              <SecretValue
                revealKey={`ssn:${person.id}`}
                label={`${person.name} SSN`}
                value={person.ssn}
                masked={maskSsn(person.ssn)}
              />
              <SecretValue
                revealKey={`pin:${person.id}`}
                label={`${person.name} IP PIN`}
                value={person.ipPin ?? "None"}
                masked={person.ipPin ? maskPin() : "None"}
              />
            </dl>
          </div>
        ))}
      </div>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <SecretValue
          revealKey="bank:routing"
          label={`${bank.bank} routing`}
          value={bank.routing}
          masked={maskAccount(bank.routing)}
        />
        <SecretValue
          revealKey="bank:account"
          label={`${bank.bank} ${bank.type} account`}
          value={bank.account}
          masked={maskAccount(bank.account)}
        />
      </dl>
    </Card>
  );
}
