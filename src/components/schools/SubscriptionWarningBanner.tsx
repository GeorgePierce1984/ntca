import React from "react";
import { AlertCircle, X, CreditCard, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

interface SubscriptionWarningBannerProps {
  subscriptionStatus?: string;
  subscriptionEndDate?: string;
  onDismiss?: () => void;
  dismissed?: boolean;
}

export const SubscriptionWarningBanner: React.FC<
  SubscriptionWarningBannerProps
> = ({
  subscriptionStatus,
  subscriptionEndDate,
  onDismiss,
  dismissed = false,
}) => {
  const navigate = useNavigate();

  if (dismissed) return null;

  const status = subscriptionStatus?.toLowerCase();

  // Only show for cancelled or past_due subscriptions
  if (status !== "cancelled" && status !== "past_due") {
    return null;
  }

  const isCancelled = status === "cancelled";
  const isPastDue = status === "past_due";

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`${
          isCancelled
            ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
            : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
        } border rounded-lg p-4 mb-6`}
      >
        <div className="flex items-start gap-3">
          <AlertCircle
            className={`w-5 h-5 mt-0.5 ${
              isCancelled
                ? "text-red-600 dark:text-red-400"
                : "text-amber-600 dark:text-amber-400"
            }`}
          />
          <div className="flex-1">
            <h3
              className={`font-semibold mb-1 ${
                isCancelled
                  ? "text-red-900 dark:text-red-100"
                  : "text-amber-900 dark:text-amber-100"
              }`}
            >
              {isCancelled
                ? "Subscription Expired"
                : "Payment Past Due"}
            </h3>
            <p
              className={`text-sm mb-3 ${
                isCancelled
                  ? "text-red-700 dark:text-red-300"
                  : "text-amber-700 dark:text-amber-300"
              }`}
            >
              {isCancelled ? (
                <>
                  Your subscription expired on{" "}
                  {formatDate(subscriptionEndDate)}. All active job postings
                  have been paused. Renew your subscription to reactivate your
                  jobs and post new openings.
                </>
              ) : (
                <>
                  Your payment is past due. Please update your payment method to
                  continue posting jobs and avoid service interruption.
                </>
              )}
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant={isCancelled ? "gradient" : "primary"}
                size="sm"
                onClick={() => navigate("/schools/subscription")}
                rightIcon={<CreditCard className="w-4 h-4" />}
              >
                {isCancelled ? "Renew Subscription" : "Update Payment"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/pricing")}
                rightIcon={<ExternalLink className="w-4 h-4" />}
              >
                View Plans
              </Button>
            </div>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className={`p-1 rounded hover:bg-opacity-20 ${
                isCancelled
                  ? "hover:bg-red-600"
                  : "hover:bg-amber-600"
              } transition-colors`}
              aria-label="Dismiss warning"
            >
              <X
                className={`w-4 h-4 ${
                  isCancelled
                    ? "text-red-600 dark:text-red-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}
              />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};


