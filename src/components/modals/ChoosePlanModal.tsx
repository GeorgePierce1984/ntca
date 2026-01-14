import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Star,
  AlertCircle,
  ArrowLeft,
  CreditCard,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SchoolPlan {
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  jobLimit: string;
  features: string[];
  priceIdMonthly?: string;
  priceIdAnnual?: string;
  popular?: boolean;
}

interface ChoosePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanSelect?: (plan: SchoolPlan) => void;
  onContinue: (plan: SchoolPlan, billingType: "monthly" | "annual") => void;
  onBack?: () => void;
  initialSelectedPlan?: SchoolPlan | null;
  initialBillingType?: "monthly" | "annual";
  loading?: boolean;
  errors?: {
    plan?: string;
    submit?: string;
  };
  showBackButton?: boolean;
  isReturningFromPayment?: boolean;
}

const defaultPlans: SchoolPlan[] = [
  {
    name: "Starter",
    priceMonthly: 49,
    priceAnnual: 470,
    jobLimit: "5 job postings",
    features: [
      "Up to 5 active job postings",
      "Basic applicant management",
      "Email notifications",
      "Standard support",
    ],
    priceIdMonthly: import.meta.env.VITE_STRIPE_BASIC_MONTHLY_USD?.trim(),
    priceIdAnnual: import.meta.env.VITE_STRIPE_BASIC_ANNUAL_USD?.trim(),
  },
  {
    name: "Professional",
    priceMonthly: 99,
    priceAnnual: 950,
    jobLimit: "15 job postings",
    features: [
      "Up to 15 active job postings",
      "Advanced applicant filtering",
      "Interview scheduling",
      "Analytics dashboard",
      "Priority support",
      "Custom branding",
    ],
    priceIdMonthly: import.meta.env.VITE_STRIPE_STANDARD_MONTHLY_USD?.trim(),
    priceIdAnnual: import.meta.env.VITE_STRIPE_STANDARD_ANNUAL_USD?.trim(),
    popular: true,
  },
  {
    name: "Enterprise",
    priceMonthly: 199,
    priceAnnual: 1910,
    jobLimit: "Unlimited postings",
    features: [
      "Unlimited job postings",
      "Advanced analytics",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
      "White-label solution",
    ],
    priceIdMonthly: import.meta.env.VITE_STRIPE_PREMIUM_MONTHLY_USD?.trim(),
    priceIdAnnual: import.meta.env.VITE_STRIPE_PREMIUM_ANNUAL_USD?.trim(),
  },
];

export const ChoosePlanModal: React.FC<ChoosePlanModalProps> = ({
  isOpen,
  onClose,
  onPlanSelect,
  onContinue,
  onBack,
  initialSelectedPlan = null,
  initialBillingType = "monthly",
  loading = false,
  errors = {},
  showBackButton = true,
  isReturningFromPayment = false,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<SchoolPlan | null>(
    initialSelectedPlan
  );
  const [billingType, setBillingType] = useState<"monthly" | "annual">(
    initialBillingType
  );

  // Update selected plan when prop changes
  useEffect(() => {
    if (initialSelectedPlan) {
      setSelectedPlan(initialSelectedPlan);
    }
  }, [initialSelectedPlan]);

  // Update billing type when prop changes
  useEffect(() => {
    setBillingType(initialBillingType);
  }, [initialBillingType]);

  const handlePlanSelect = (plan: SchoolPlan) => {
    setSelectedPlan(plan);
    if (onPlanSelect) {
      onPlanSelect(plan);
    }
  };

  const handleContinue = () => {
    if (!selectedPlan) {
      return;
    }
    onContinue(selectedPlan, billingType);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-6xl w-full p-8 my-8 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <div className="flex justify-end mb-4">
                <button
                  onClick={onClose}
                  className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Header */}
              <h2 className="heading-2 text-center mb-8">Choose Your Plan</h2>

              {/* Show message when returning from payment */}
              {isReturningFromPayment && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-500" />
                    <p className="text-blue-600 dark:text-blue-400">
                      Welcome back! Your information has been saved. Please
                      select a plan to continue.
                    </p>
                  </div>
                </div>
              )}

              {/* Billing Toggle */}
              <div className="flex justify-center mb-8">
                <div className="bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
                  <button
                    onClick={() => setBillingType("monthly")}
                    className={`px-4 py-2 rounded-md transition-all ${
                      billingType === "monthly"
                        ? "bg-white dark:bg-neutral-700 shadow-sm"
                        : "text-neutral-600 dark:text-neutral-400"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingType("annual")}
                    className={`px-4 py-2 rounded-md transition-all ${
                      billingType === "annual"
                        ? "bg-white dark:bg-neutral-700 shadow-sm"
                        : "text-neutral-600 dark:text-neutral-400"
                    }`}
                  >
                    Annual
                    <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                      Save 20%
                    </span>
                  </button>
                </div>
              </div>

              {/* Plan Cards */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {defaultPlans.map((plan) => (
                  <motion.div
                    key={plan.name}
                    whileHover={{ scale: 1.02 }}
                    className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedPlan?.name === plan.name
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                    }`}
                    onClick={() => handlePlanSelect(plan)}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Popular
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-4">
                      <h3 className="font-bold text-xl mb-2">{plan.name}</h3>
                      <div className="mb-2">
                        <span className="text-3xl font-bold">
                          $
                          {billingType === "monthly"
                            ? plan.priceMonthly
                            : plan.priceAnnual}
                        </span>
                        <span className="text-neutral-600 dark:text-neutral-400">
                          /{billingType === "monthly" ? "month" : "year"}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {plan.jobLimit}
                      </p>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {selectedPlan?.name === plan.name && (
                      <div className="absolute top-4 right-4">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Error Messages */}
              {errors.plan && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-6">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-red-600 dark:text-red-400">
                      {errors.plan}
                    </p>
                  </div>
                </div>
              )}

              {errors.submit && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-6">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-red-600 dark:text-red-400">
                      {errors.submit}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center gap-4 mt-8">
                {showBackButton && onBack ? (
                  <Button
                    onClick={handleBack}
                    variant="secondary"
                    leftIcon={<ArrowLeft className="w-5 h-5" />}
                  >
                    Back
                  </Button>
                ) : (
                  <div />
                )}
                <Button
                  onClick={handleContinue}
                  variant="gradient"
                  disabled={!selectedPlan || loading}
                  rightIcon={<CreditCard className="w-5 h-5" />}
                >
                  {loading ? "Processing..." : "Continue to Payment"}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

