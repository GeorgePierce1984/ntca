import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { ChoosePlanModal } from "@/components/modals/ChoosePlanModal";
import toast from "react-hot-toast";

interface PaywallProps {
  children: React.ReactNode;
  isBlocked: boolean;
  featureName?: string;
  description?: string;
}

export const Paywall: React.FC<PaywallProps> = ({
  children,
  isBlocked,
  featureName = "This feature",
  description = "Subscribe to unlock this feature and access all premium functionality.",
}) => {
  const [showPlanModal, setShowPlanModal] = useState(false);

  if (!isBlocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="blur-sm pointer-events-none select-none opacity-50">
        {children}
      </div>

      {/* Paywall overlay */}
      <div 
        className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8 max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
            {featureName} Requires Subscription
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            {description}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowPlanModal(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium hover:from-primary-600 hover:to-secondary-600 transition-all shadow-lg"
          >
            Choose Your Plan
          </button>
        </motion.div>
      </div>

      {/* Choose Plan Modal */}
      <ChoosePlanModal
        isOpen={showPlanModal}
        onClose={(e?: React.MouseEvent) => {
          if (e) {
            e.stopPropagation();
          }
          setShowPlanModal(false);
        }}
        onContinue={async (plan, billingType) => {
          try {
            // Get the price ID based on plan and billing type
            const priceId = billingType === "monthly" 
              ? plan.priceIdMonthly 
              : plan.priceIdAnnual;

            if (!priceId) {
              // Fallback to pricing page if price ID not found
              window.location.href = "/pricing";
              return;
            }

            // Get user email from auth token
            const token = localStorage.getItem("authToken");
            let userEmail = null;
            
            // Try to get user email from profile API
            try {
              const response = await fetch("/api/schools/profile", {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              if (response.ok) {
                const data = await response.json();
                userEmail = data.school?.user?.email;
              }
            } catch (e) {
              console.error("Error fetching user email:", e);
            }

            // Create Stripe checkout session
            const response = await fetch("/api/create-checkout-session", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                priceId,
                userType: "school",
                planName: plan.name,
                billingType,
                formData: {
                  email: userEmail,
                },
                successUrl: `${window.location.origin}/schools/dashboard?session_id={CHECKOUT_SESSION_ID}`,
                cancelUrl: window.location.href, // Return to current page
              }),
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.error || "Failed to create checkout session");
            }

            if (data.url) {
              // Redirect to Stripe checkout
              window.location.href = data.url;
            } else {
              // Fallback to pricing page
              window.location.href = "/pricing";
            }
          } catch (error) {
            console.error("Error creating checkout session:", error);
            // Fallback to pricing page on error
            window.location.href = "/pricing";
          }
        }}
      />
    </div>
  );
};

