/**
 * Check if a school has an active subscription
 * @param subscriptionStatus - The subscription status from the API
 * @returns boolean - true if subscription is active
 */
export function hasActiveSubscription(subscriptionStatus: string | null | undefined): boolean {
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
 */
export function canAccessPremiumFeatures(subscriptionStatus: string | null | undefined): boolean {
  return hasActiveSubscription(subscriptionStatus);
}

