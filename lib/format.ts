import type { ExtractedValue } from "@/lib/types";

export function formatMoney(value: number): string {
  const fractionDigits = Number.isInteger(value) ? 0 : 2;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatComputedAt(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function formatExtractedValue(value: ExtractedValue): string {
  if (value.value === null || value.value === undefined || value.value === "") {
    return "missing";
  }
  if (typeof value.value === "number" && value.value_type === "money") {
    return formatMoney(value.value);
  }
  return String(value.value);
}
