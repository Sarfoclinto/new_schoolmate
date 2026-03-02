import {
  CURRENCIES,
  type CurrencyRenderMode,
  type SupportedCurrency,
} from "@/types/currency";

export function toCurrency(value: number, currency = "GHS") {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency,
  }).format(value);
}

export function formatCurrency<C extends SupportedCurrency>(
  amount: number,
  currency: C,
  options: CurrencyRenderMode,
): string {
  const meta = CURRENCIES[currency];

  if (options.type === "subunit") {
    const value = Math.round(amount * meta.subunit.factor);
    const name =
      options.pluralize && value !== 1
        ? `${meta.subunit.name}s`
        : meta.subunit.name;

    return `${value} ${name}`;
  }

  const formatter = new Intl.NumberFormat(options.locale ?? "en-GH", {
    style: "currency",
    currency: meta.code,
    currencyDisplay: options.display ?? "symbol",
    minimumFractionDigits: options.minimumFractionDigits ?? 2,
  });

  return formatter.format(amount);
}
