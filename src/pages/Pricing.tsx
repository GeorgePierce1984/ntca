import React, { useState } from "react";
import {
  Check,
  Building2,
  GraduationCap,
  Star,
  Zap,
  Users,
  Mail,
  Info,
  X,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Plan {
  name: string;
  priceMonthly: number;
  priceAnnual: number; // already discounted
  jobLimit: string;
  features: string[];
  priceIdMonthlyEnv: string;
  priceIdAnnualEnv: string;
  popular?: boolean;
}

const plans: Plan[] = [
  {
    name: "Basic",
    priceMonthly: 49,
    priceAnnual: 519, // Annual price matching Stripe configuration
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
    jobLimit: "Unlimited + AI Matching",
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

const teacherFeatures = [
  {
    icon: <Check className="w-5 h-5" />,
    text: "Create detailed teacher profile",
  },
  {
    icon: <Check className="w-5 h-5" />,
    text: "Browse unlimited job listings",
  },
  { icon: <Check className="w-5 h-5" />, text: "Apply to positions directly" },
  { icon: <Check className="w-5 h-5" />, text: "Get job alerts via email" },
  { icon: <Check className="w-5 h-5" />, text: "Access CELTA resources" },
  { icon: <Check className="w-5 h-5" />, text: "Career guidance materials" },
  {
    icon: <Star className="w-5 h-5 text-amber-500" />,
    text: "Premium: Priority matching with top schools",
  },
];

const Pricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly",
  );
  const [showPlanInfo, setShowPlanInfo] = useState<string | null>(null);
  const navigate = useNavigate();

  const planDetails = {
    Basic: {
      postingDuration: "30 days",
      renewalOption: "Manual renewal available",
      visibility: "Standard visibility in search results",
      applicantTracking: "Basic applicant management",
      support: "Email support (48hr response)",
    },
    Standard: {
      postingDuration: "45 days",
      renewalOption: "Auto-renewal option available",
      visibility: "Priority placement in search results",
      applicantTracking: "Advanced applicant filtering & tracking",
      support: "Priority email & chat support (24hr response)",
    },
    Premium: {
      postingDuration: "60 days",
      renewalOption: "Auto-renewal with flexible scheduling",
      visibility: "Top placement + featured badge",
      applicantTracking: "AI-powered applicant matching & ranking",
      support: "Dedicated account manager + instant support",
    },
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="section bg-gradient-to-br from-blue-50 via-purple-50 to-amber-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        <div className="container-custom text-center">
          <h1 className="heading-1 gradient-text mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto mb-12">
            Choose the right plan for your needs. Schools pay to post jobs,
            teachers join for free.
          </p>

          {/* Two-column layout for different user types */}
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* For Schools */}
            <div className="text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 mb-6">
                <Building2 className="w-5 h-5" />
                <span className="font-medium">For Schools & Institutions</span>
              </div>
              <h2 className="heading-2 mb-4">Post Jobs & Find Teachers</h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                Subscription plans to post job listings and connect with
                qualified teachers across Central Asia.
              </p>
            </div>

            {/* For Teachers */}
            <div className="text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 mb-6">
                <GraduationCap className="w-5 h-5" />
                <span className="font-medium">For Teachers</span>
              </div>
              <h2 className="heading-2 mb-4">Always Free to Join</h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                Create your profile, browse jobs, and apply - completely free.
                Premium matching available.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* School Subscription Plans */}
      <section className="section">
        <div className="container-custom">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 mb-6">
              <Building2 className="w-5 h-5" />
              <span className="font-medium">School Subscription Plans</span>
            </div>
            <h2 className="heading-1 mb-6">Find the Perfect Teachers</h2>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto mb-6">
              Flexible plans for schools of all sizes. Switch or cancel anytime.
              Save up to 17% with annual billing.
            </p>

            {/* What is a job posting? */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 max-w-2xl mx-auto mb-10">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>What counts as a job posting?</strong> Each position you
                advertise counts as one posting. Postings remain active for
                30-60 days depending on your plan. You can pause, edit, or renew
                postings anytime.
              </p>
            </div>

            {/* Billing toggle */}
            <div className="inline-flex mb-12 bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  billingCycle === "monthly"
                    ? "bg-white dark:bg-neutral-900"
                    : "opacity-70"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  billingCycle === "annual"
                    ? "bg-white dark:bg-neutral-900"
                    : "opacity-70"
                }`}
              >
                Annual (Save 17%)
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {plans.map((plan) => {
              const price =
                billingCycle === "monthly"
                  ? plan.priceMonthly
                  : plan.priceAnnual;

              const handleCheckout = () => {
                navigate(`/schools/signup?plan=${plan.name.toLowerCase()}`);
              };

              return (
                <div
                  key={plan.name}
                  className={`card p-8 flex flex-col relative ${plan.popular ? "ring-2 ring-blue-500" : ""}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <h3 className="heading-3 mb-4">{plan.name}</h3>
                  <div className="flex items-baseline mb-2">
                    <span className="text-4xl font-bold">${price}</span>
                    <span className="text-neutral-500 ml-2">
                      /{billingCycle === "monthly" ? "mo" : "yr"}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500 mb-2">
                    {plan.jobLimit}
                  </p>

                  {/* More Info Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPlanInfo(plan.name);
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-6 inline-flex items-center gap-1"
                  >
                    <Info className="w-4 h-4" />
                    More details
                  </button>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-neutral-600 dark:text-neutral-400">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={handleCheckout}
                    className={`w-full ${plan.popular ? "btn-primary" : "btn-secondary"}`}
                  >
                    Get Started
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Teacher Free Section */}
      <section className="section bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 mb-6">
                <GraduationCap className="w-5 h-5" />
                <span className="font-medium">For Teachers</span>
              </div>
              <h2 className="heading-1 mb-6">Join for Free, Forever</h2>
              <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8">
                Access thousands of teaching opportunities across Central Asia. No
                subscription required.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Free Teacher Plan */}
              <div className="card p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-4">
                    <GraduationCap className="w-8 h-8" />
                  </div>
                  <h3 className="heading-3 mb-2">Free Teacher Account</h3>
                  <div className="text-4xl font-bold text-green-600">$0</div>
                  <p className="text-neutral-500 mb-6">Always free</p>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Create detailed profile
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Browse unlimited jobs
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Apply to positions
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Basic job alerts
                    </span>
                  </li>
                </ul>

                <div className="text-center">
                  <button
                    onClick={() => navigate("/signup")}
                    className="btn-secondary w-full mb-4"
                  >
                    Create Free Account
                  </button>
                  <p className="text-sm text-neutral-500">
                    No credit card required
                  </p>
                </div>
              </div>

              {/* Premium Teacher Plan */}
              <div className="card p-8 relative ring-2 ring-blue-500">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>

                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
                    <Star className="w-8 h-8" />
                  </div>
                  <h3 className="heading-3 mb-2">Premium Teacher Account</h3>
                  <div className="text-4xl font-bold text-blue-600">$19</div>
                  <p className="text-neutral-500 mb-6">per month</p>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-600 dark:text-neutral-400">
                      All Free features
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Priority matching with top schools
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Advanced job alerts
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Resume optimization
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Interview coaching
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Premium support
                    </span>
                  </li>
                </ul>

                <div className="text-center">
                  <button
                    onClick={() => navigate("/signup")}
                    className="btn-primary w-full mb-4"
                  >
                    Get Premium Access
                  </button>
                  <p className="text-sm text-neutral-500">
                    Start with 7-day free trial
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ or Additional Info */}
      <section className="section">
        <div className="container-custom text-center">
          <h2 className="heading-2 mb-12">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            <div className="card p-6">
              <h3 className="font-semibold mb-3">
                Why do schools pay but teachers don't?
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Schools benefit from our recruiting platform and teacher
                network. Teachers contribute by creating profiles and engaging
                with opportunities.
              </p>
            </div>
            <div className="card p-6">
              <h3 className="font-semibold mb-3">
                Can I change plans anytime?
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Yes, upgrade or downgrade your school subscription at any time.
                Changes take effect at your next billing cycle.
              </p>
            </div>
            <div className="card p-6">
              <h3 className="font-semibold mb-3">
                What currencies do you accept?
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                We accept payments in 135+ currencies. Prices are shown in USD
                but you can pay in your local currency.
              </p>
            </div>
            <div className="card p-6">
              <h3 className="font-semibold mb-3">How does AI matching work?</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Our Premium plan uses AI to automatically match your job
                requirements with qualified teachers in our network.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Plan Details Modal */}
      {showPlanInfo && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl max-w-lg w-full p-6 relative">
            <button
              onClick={() => setShowPlanInfo(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="heading-3 mb-6">{showPlanInfo} Plan Details</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium">Posting Duration</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {
                      planDetails[showPlanInfo as keyof typeof planDetails]
                        .postingDuration
                    }{" "}
                    active per posting
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <RefreshCw className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Renewal Options</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {
                      planDetails[showPlanInfo as keyof typeof planDetails]
                        .renewalOption
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium">Visibility</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {
                      planDetails[showPlanInfo as keyof typeof planDetails]
                        .visibility
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium">Applicant Management</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {
                      planDetails[showPlanInfo as keyof typeof planDetails]
                        .applicantTracking
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-indigo-500 mt-0.5" />
                <div>
                  <p className="font-medium">Support Level</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {
                      planDetails[showPlanInfo as keyof typeof planDetails]
                        .support
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                <strong>Note:</strong> Unused job postings roll over to the next
                month for Standard and Premium plans. Basic plan postings expire
                at the end of each billing cycle.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pricing;
