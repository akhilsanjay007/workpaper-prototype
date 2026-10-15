import type { SensitiveSecrets } from "@/lib/types";

export function maskSsn(ssn: string): string {
  return `***-**-${ssn.slice(-4)}`;
}

export function maskAccount(account: string): string {
  return `****${account.slice(-4)}`;
}

export function maskPin(): string {
  return "******";
}

export function maskText(text: string, secrets: SensitiveSecrets): string {
  let masked = text;
  for (const ssn of secrets.ssns) {
    masked = masked.replaceAll(ssn, maskSsn(ssn));
  }
  masked = masked.replace(/\b\d{3}-\d{2}-\d{4}\b/g, (value) => maskSsn(value));
  for (const pin of secrets.pins) {
    masked = masked.replaceAll(pin, maskPin());
  }
  for (const account of secrets.accounts) {
    masked = masked.replaceAll(account, maskAccount(account));
  }
  return masked;
}
