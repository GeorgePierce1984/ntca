type SubscriptionUser = {
  userType?: "SCHOOL" | "TEACHER";
  school?: {
    name?: string;
  };
} | null | undefined;

const SUBSCRIPTIONS_ENABLED =
  import.meta.env.VITE_SUBSCRIPTIONS_ENABLED === "true";
const SUBSCRIPTION_TEST_SCHOOL_NAME = "Forest School 2.0";

export function areSubscriptionsEnabled(): boolean {
  return SUBSCRIPTIONS_ENABLED;
}

export function isSubscriptionTestSchool(user: SubscriptionUser): boolean {
  return (
    user?.userType === "SCHOOL" &&
    user.school?.name === SUBSCRIPTION_TEST_SCHOOL_NAME
  );
}

export function canAccessSubscriptionPages(user: SubscriptionUser): boolean {
  return areSubscriptionsEnabled() || isSubscriptionTestSchool(user);
}

/**
 * Check if a school has an active subscription
 * @param subscriptionStatus - The subscription status from the API
 * @returns boolean - true if subscription is active
 */
export function hasActiveSubscription(
  subscriptionStatus: string | null | undefined,
): boolean {
  if (!areSubscriptionsEnabled()) return true;
  if (!subscriptionStatus) return false;

  const status = subscriptionStatus.toLowerCase();
  return status === "active";
}

/**
 * Check if a school can access premium features
 * Premium features include:
 * - Messaging
 * - Viewing applicants
 * - Posting more than 1 job
 * 
 * @param subscriptionStatus - The subscription status from the API
 * @param isLoading - Whether subscription status is still being fetched (defaults to false)
 * @returns boolean - true if subscription is active, or if still loading (to prevent flash)
 */
export function canAccessPremiumFeatures(
  subscriptionStatus: string | null | undefined,
  isLoading: boolean = false
): boolean {
  if (!areSubscriptionsEnabled()) return true;

  // If still loading, allow access to prevent paywall flash
  if (isLoading) return true;
  
  return hasActiveSubscription(subscriptionStatus);
}

