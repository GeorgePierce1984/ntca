export interface SchoolPlan {
  name: "Basic" | "Standard" | "Premium";
  priceMonthly: number;
  priceAnnual: number; // already discounted
  jobLimit: string;
  features: string[];
  priceIdMonthlyEnv: "VITE_STRIPE_BASIC_MONTHLY_USD" | "VITE_STRIPE_STANDARD_MONTHLY_USD" | "VITE_STRIPE_PREMIUM_MONTHLY_USD";
  priceIdAnnualEnv: "VITE_STRIPE_BASIC_ANNUAL_USD" | "VITE_STRIPE_STANDARD_ANNUAL_USD" | "VITE_STRIPE_PREMIUM_ANNUAL_USD";
  popular?: boolean;
}

export const SCHOOL_PRICING_PLANS: SchoolPlan[] = [
  {
    name: "Basic",
    priceMonthly: 49,
    priceAnnual: 519,
    jobLimit: "5 jobs / mo",
    features: [
      "5 job postings per month",
      "Standard listings",
      "Email support",
      "Basic analytics",
    ],
    priceIdMonthlyEnv: "VITE_STRIPE_BASIC_MONTHLY_USD",
    priceIdAnnualEnv: "VITE_STRIPE_BASIC_ANNUAL_USD",
  },
  {
    name: "Standard",
    priceMonthly: 109,
    priceAnnual: Math.round(109 * 12 * 0.83), // 17% discount
    jobLimit: "25 jobs / mo",
    features: [
      "25 job postings per month",
      "Premium listings with highlighting",
      "Priority support",
      "Email promotion to teacher network",
      "Advanced analytics",
      "Featured school badge",
    ],
    priceIdMonthlyEnv: "VITE_STRIPE_STANDARD_MONTHLY_USD",
    priceIdAnnualEnv: "VITE_STRIPE_STANDARD_ANNUAL_USD",
    popular: true,
  },
  {
    name: "Premium",
    priceMonthly: 199,
    priceAnnual: Math.round(199 * 12 * 0.83), // 17% discount
    jobLimit: "Unlimited",
    features: [
      "Unlimited job postings",
      "AI-powered teacher matching",
      "Automated email campaigns",
      "Priority listing placement",
      "Dedicated account manager",
      "Custom branding",
      "API access",
    ],
    priceIdMonthlyEnv: "VITE_STRIPE_PREMIUM_MONTHLY_USD",
    priceIdAnnualEnv: "VITE_STRIPE_PREMIUM_ANNUAL_USD",
  },
];

export function getSchoolPlansWithPriceIds() {
  const env = (import.meta as any).env || {};
  return SCHOOL_PRICING_PLANS.map((p) => ({
    ...p,
    priceIdMonthly: (env[p.priceIdMonthlyEnv] || "").toString().trim() || undefined,
    priceIdAnnual: (env[p.priceIdAnnualEnv] || "").toString().trim() || undefined,
  }));
}


