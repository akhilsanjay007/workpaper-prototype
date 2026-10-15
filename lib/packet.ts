import rawPacket from "@/data/okafor_lindqvist_2025_packet.json";
import type {
  DemoStaff,
  Diagnostic,
  ExtractedValue,
  HouseholdView,
  Packet,
  QuestionnaireAnswer,
  ReturnLine,
  ReturnVersion,
  TaxDocument,
} from "@/lib/types";

const packet = rawPacket as Packet;

const version = packet.return_versions.find((item) => item.version === "v3");

if (!version) {
  throw new Error("Return version v3 is missing from the packet.");
}

const v3: ReturnVersion = version;

const extractedById = new Map<string, ExtractedValue>(
  packet.extracted_values.map((value) => [value.id, value]),
);

const documentsById = new Map<string, TaxDocument>(
  packet.documents.map((document) => [document.id, document]),
);

const linesByKey = new Map<string, ReturnLine>(v3.lines.map((line) => [line.key, line]));

export function getV3(): ReturnVersion {
  return v3;
}

export function getDiagnostics(): Diagnostic[] {
  return v3.diagnostics;
}

export function getLine(key: string): ReturnLine | undefined {
  return linesByKey.get(key);
}

export function getExtractedValue(id: string): ExtractedValue | undefined {
  return extractedById.get(id);
}

export function getDocument(id: string): TaxDocument | undefined {
  return documentsById.get(id);
}

const DEMO_IDS = ["st-01", "st-02", "st-03", "st-04"];

export function getDemoStaff(): DemoStaff[] {
  return packet.firm.staff
    .filter((person) => DEMO_IDS.includes(person.id))
    .filter((person): person is typeof person & { role: DemoStaff["role"] } =>
      person.role === "preparer" || person.role === "reviewer" || person.role === "partner",
    )
    .map((person) => ({
      id: person.id,
      name: person.name,
      role: person.role,
      clearance: person.sensitive_data_clearance,
    }));
}

export function getRequiredSteps(): string[] {
  return packet.firm.starter_standards.required_steps;
}

export function getEngagementEventId(): string | null {
  return packet.timeline.find((event) => event.event === "engagement_signed")?.id ?? null;
}

export function getQuestionnaireAnswer(id: string): QuestionnaireAnswer | undefined {
  const answer = packet.client.questionnaire.find((item) => item.id === id);
  if (!answer) return undefined;
  return {
    id: answer.id,
    question: answer.question,
    answer: answer.answer,
    answeredBy: answer.answered_by,
  };
}

export function getHousehold(): HouseholdView {
  const people = packet.household.people
    .filter((person) => person.ssn)
    .map((person) => ({
      id: person.id,
      name: person.name,
      role: person.role,
      ssn: person.ssn ?? "",
      ipPin: person.ip_pin ?? null,
    }));
  const bank = packet.household.bank_account_for_refund_or_payment;
  return {
    people: people.filter((person) => person.role === "taxpayer" || person.role === "spouse"),
    bank,
    secrets: {
      ssns: people.map((person) => person.ssn),
      pins: people.flatMap((person) => (person.ipPin ? [person.ipPin] : [])),
      accounts: [bank.account, bank.routing],
    },
  };
}
