export type Severity = "info" | "warning";

export type Diagnostic = {
  code: string;
  severity: Severity;
  message: string;
  refs: string[];
};

export type ReturnLine = {
  key: string;
  jurisdiction: string;
  form: string;
  line: string;
  label: string;
  value: number | string | null;
  sources?: string[];
};

export type FederalSummary = {
  agi: number;
  taxable_income: number;
  total_tax: number;
  payments: number;
  balance_due: number;
  penalty: number;
};

export type TaxEffectRates = {
  stcg: { federal_per_dollar: number; california_per_dollar: number };
  ca_source_income: { federal_per_dollar: number; california_per_dollar: number };
};

export type ReturnVersion = {
  version: string;
  computed_at: string;
  summary: {
    federal: FederalSummary;
  };
  tax_effect_rates: TaxEffectRates;
  diagnostics: Diagnostic[];
  lines: ReturnLine[];
};

export type DemoStaff = {
  id: string;
  name: string;
  role: "preparer" | "reviewer" | "partner";
  clearance: boolean;
};

export type QuestionnaireAnswer = {
  id: string;
  question: string;
  answer: string;
  answeredBy: string;
};

export type SensitiveSecrets = {
  ssns: string[];
  pins: string[];
  accounts: string[];
};

export type HouseholdView = {
  people: Array<{
    id: string;
    name: string;
    role: string;
    ssn: string;
    ipPin: string | null;
  }>;
  bank: {
    bank: string;
    routing: string;
    account: string;
    type: string;
  };
  secrets: SensitiveSecrets;
};

export type ExtractedValue = {
  id: string;
  document_id: string;
  page: number;
  field: string;
  label: string;
  value: string | number | boolean | null;
  value_type: string;
  text_as_read: string;
  confidence: number;
};

export type TaxDocument = {
  id: string;
  title: string;
  document_type: string;
  pages: Array<{
    page: number;
    printed_content: string;
  }>;
};

export type Packet = {
  return_versions: ReturnVersion[];
  extracted_values: ExtractedValue[];
  documents: TaxDocument[];
  household: {
    people: Array<{
      id: string;
      role: string;
      name: string;
      ssn?: string;
      ip_pin?: string | null;
    }>;
    bank_account_for_refund_or_payment: {
      routing: string;
      account: string;
      type: string;
      bank: string;
    };
  };
  client: {
    questionnaire: Array<{
      id: string;
      question: string;
      answer: string;
      answered_by: string;
    }>;
  };
  firm: {
    staff: Array<{
      id: string;
      name: string;
      role: string;
      sensitive_data_clearance: boolean;
    }>;
    starter_standards: {
      required_steps: string[];
    };
  };
  timeline: Array<{
    id: string;
    at: string;
    event: string;
  }>;
};
