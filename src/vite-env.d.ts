/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRIPE_BASIC_MONTHLY_USD: string;
  readonly VITE_STRIPE_BASIC_ANNUAL_USD: string;
  readonly VITE_STRIPE_STANDARD_MONTHLY_USD: string;
  readonly VITE_STRIPE_STANDARD_ANNUAL_USD: string;
  readonly VITE_STRIPE_PREMIUM_MONTHLY_USD: string;
  readonly VITE_STRIPE_PREMIUM_ANNUAL_USD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
