const SUBSCRIPTION_TEST_SCHOOL_NAME = "Forest School 2.0";

export function areSubscriptionsEnabled() {
  return process.env.SUBSCRIPTIONS_ENABLED === "true";
}

export function isSubscriptionTestSchool(school) {
  return school?.name === SUBSCRIPTION_TEST_SCHOOL_NAME;
}

export function shouldEnforceSubscriptionsForSchool(school) {
  if (!areSubscriptionsEnabled()) {
    return false;
  }

  return !isSubscriptionTestSchool(school);
}
