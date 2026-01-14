import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock } from "lucide-react";
import { ChoosePlanModal } from "@/components/modals/ChoosePlanModal";

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
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8 max-w-md"
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
            onClick={() => setShowPlanModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium hover:from-primary-600 hover:to-secondary-600 transition-all shadow-lg"
          >
            Choose Your Plan
          </button>
        </motion.div>
      </div>

      {/* Choose Plan Modal */}
      <ChoosePlanModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        onContinue={(plan, billingType) => {
          // Redirect to pricing/subscription page
          window.location.href = "/pricing";
        }}
      />
    </div>
  );
};

