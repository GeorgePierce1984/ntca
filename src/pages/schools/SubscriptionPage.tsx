import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Settings,
  DollarSign,
  Info,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

interface Subscription {
  subscriptionId?: string;
  subscriptionStatus?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  subscriptionEndDate?: string;
  plan?: {
    name: string;
    amount: number;
    currency: string;
    interval: string;
    intervalCount: number;
  };
  billingCycle?: string;
  daysRemaining?: number;
}

export const SubscriptionPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (!user || user.userType !== "SCHOOL") {
      navigate("/login");
      return;
    }
    fetchSubscription();
  }, [user, navigate]);

  const fetchSubscription = async () => {
    try {
      // Fetch detailed subscription info from the dedicated endpoint
      const response = await fetch("/api/subscription-details", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription({
          subscriptionId: data.subscriptionId,
          subscriptionStatus: data.subscriptionStatus,
          currentPeriodStart: data.currentPeriodStart,
          currentPeriodEnd: data.currentPeriodEnd,
          cancelAtPeriodEnd: data.cancelAtPeriodEnd,
          subscriptionEndDate: data.subscriptionEndDate,
          plan: data.plan,
          billingCycle: data.billingCycle,
          daysRemaining: data.daysRemaining,
        });
      } else {
        // Fallback to profile endpoint if subscription-details fails
        const profileResponse = await fetch("/api/schools/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setSubscription({
            subscriptionId: profileData.subscriptionId,
            subscriptionStatus: profileData.subscriptionStatus,
            currentPeriodStart: null,
            currentPeriodEnd: profileData.currentPeriodEnd,
            cancelAtPeriodEnd: profileData.cancelAtPeriodEnd,
            subscriptionEndDate: profileData.subscriptionEndDate,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
      toast.error("Failed to load subscription information");
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user?.stripeCustomerId) {
      toast.error("No subscription found");
      return;
    }

    setPortalLoading(true);
    try {
      const response = await fetch("/api/create-portal-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          customerId: user.stripeCustomerId,
          returnUrl: `${window.location.origin}/schools/subscription`,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Failed to open subscription management");
      }
    } catch (error) {
      console.error("Error creating portal session:", error);
      toast.error("Failed to open subscription management");
    } finally {
      setPortalLoading(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
            <CheckCircle className="w-4 h-4" />
            Active
          </span>
        );
      case "past_due":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
            <AlertCircle className="w-4 h-4" />
            Past Due
          </span>
        );
      case "cancelled":
      case "canceled":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
            <XCircle className="w-4 h-4" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
            Unknown
          </span>
        );
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pt-20">
        <div className="container-custom py-12">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pt-20">
      <div className="container-custom py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="heading-1 mb-2">Subscription Management</h1>
                <p className="text-lg text-neutral-600 dark:text-neutral-400">
                  Manage your subscription, billing, and payment methods
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => navigate("/schools/dashboard")}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>

          {/* Subscription Status Card */}
          <div className="card p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="heading-3 mb-2">Current Subscription</h2>
                <p className="text-neutral-600 dark:text-neutral-400">
                  View and manage your subscription details
                </p>
              </div>
              {getStatusBadge(subscription?.subscriptionStatus)}
            </div>

            {subscription?.subscriptionId ? (
              <div className="space-y-4">
                {/* Plan Information */}
                {subscription.plan && (
                  <div className="p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                          Current Plan
                        </p>
                        <p className="font-semibold text-lg text-neutral-900 dark:text-white">
                          {subscription.plan.name}
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                          ${subscription.plan.amount.toFixed(2)}{" "}
                          {subscription.plan.currency} /{" "}
                          {subscription.plan.interval}
                          {subscription.plan.intervalCount > 1
                            ? ` (every ${subscription.plan.intervalCount} ${subscription.plan.interval}s)`
                            : ""}
                        </p>
                      </div>
                      {subscription.daysRemaining !== null &&
                        subscription.daysRemaining !== undefined && (
                          <div className="text-right">
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                              Days Remaining
                            </p>
                            <p className="font-bold text-2xl text-primary-600 dark:text-primary-400">
                              {subscription.daysRemaining}
                            </p>
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {/* Current Subscription Period */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>Current Period Start</span>
                    </div>
                    <p className="font-medium text-lg">
                      {subscription.currentPeriodStart
                        ? formatDate(subscription.currentPeriodStart)
                        : "N/A"}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>Current Period End</span>
                    </div>
                    <p className="font-medium text-lg">
                      {formatDate(subscription.currentPeriodEnd)}
                    </p>
                    {subscription.daysRemaining !== null &&
                      subscription.daysRemaining !== undefined && (
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                          {subscription.daysRemaining} days remaining
                        </p>
                      )}
                  </div>
                </div>

                {/* Subscription ID */}
                <div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                    <CreditCard className="w-4 h-4" />
                    <span>Subscription ID</span>
                  </div>
                  <p className="font-mono text-sm text-neutral-600 dark:text-neutral-400">
                    {subscription.subscriptionId.substring(0, 20)}...
                  </p>
                </div>

                {subscription.cancelAtPeriodEnd && (
                  <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                          Subscription Cancelled
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                          Your subscription will end on{" "}
                          {formatDate(subscription.currentPeriodEnd)}. You'll
                          continue to have access until then.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {subscription.subscriptionEndDate && (
                  <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-900 dark:text-red-100 mb-1">
                          Subscription Ended
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          Your subscription ended on{" "}
                          {formatDate(subscription.subscriptionEndDate)}.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                  No Active Subscription
                </p>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                  You don't have an active subscription. Subscribe to start
                  posting jobs.
                </p>
                <Button
                  variant="gradient"
                  onClick={() => navigate("/pricing")}
                  rightIcon={<ExternalLink className="w-4 h-4" />}
                >
                  View Plans
                </Button>
              </div>
            )}
          </div>

          {/* Manage Subscription Card */}
          {subscription?.subscriptionId && (
            <div className="card p-8">
              <div className="flex items-start gap-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                  <Settings className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="heading-4 mb-2">Manage Subscription</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                    Use Stripe's secure customer portal to:
                  </p>
                  <ul className="space-y-2 mb-6 text-neutral-600 dark:text-neutral-400">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Update payment methods
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      View billing history and invoices
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Cancel or modify your subscription
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Update billing information
                    </li>
                  </ul>
                  <Button
                    variant="gradient"
                    onClick={handleManageSubscription}
                    disabled={portalLoading}
                    rightIcon={
                      portalLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <ExternalLink className="w-4 h-4" />
                      )
                    }
                    glow
                  >
                    {portalLoading
                      ? "Opening..."
                      : "Open Subscription Portal"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="card p-6 mt-6 bg-neutral-100 dark:bg-neutral-800">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5" />
              <div>
                <p className="font-medium text-neutral-900 dark:text-white mb-1">
                  Need Help?
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  If you have questions about your subscription or billing,
                  please contact us at{" "}
                  <a
                    href="mailto:hello@ntca.com"
                    className="text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    hello@ntca.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

