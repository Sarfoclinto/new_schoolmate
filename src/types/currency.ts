export type CurrencyMeta = {
  code: string;
  symbol: string;
  subunit: {
    name: string;
    factor: number;
  };
};

export const CURRENCIES = {
  GHS: {
    code: "GHS",
    symbol: "₵",
    subunit: {
      name: "pesewa",
      factor: 100,
    },
  },
  USD: {
    code: "USD",
    symbol: "$",
    subunit: {
      name: "cent",
      factor: 100,
    },
  },
} as const;

export type SupportedCurrency = keyof typeof CURRENCIES;

export type CurrencyRenderMode =
  | {
      type: "currency";
      display?: "symbol" | "code";
      locale?: string;
      minimumFractionDigits?: number;
    }
  | {
      type: "subunit";
      pluralize?: boolean;
    };
