# What Happens When a Subscription Expires

## Current Implementation

### When Subscription Expires (via Stripe Webhook)

When Stripe sends a `customer.subscription.deleted` webhook event, the following happens:

1. **Database Updates** (`api/webhooks/stripe.js` - `handleSubscriptionDeleted`):
   - `subscriptionStatus` is set to `"cancelled"`
   - `subscriptionEndDate` is set to the current date/time
   - Activity is logged in the `activity_logs` table

2. **Email Notification**:
   - A cancellation email is sent to the school
   - Email includes plan details showing "Cancelled" status

3. **What Does NOT Happen** (Currently Missing):
   - ❌ No access restrictions are enforced
   - ❌ Schools can still create new job postings
   - ❌ Schools can still access all dashboard features
   - ❌ Existing jobs are not automatically paused or closed
   - ❌ No warning messages are shown in the UI

## What Should Happen (Recommended Implementation)

### 1. Access Restrictions

When `subscriptionStatus` is `"cancelled"` or `"past_due"`:

- **Job Posting**: Should be blocked
  - Show error message: "Your subscription has expired. Please renew to post new jobs."
  - Redirect to subscription/pricing page

- **Dashboard Access**: Should be limited
  - Allow viewing existing jobs and applications
  - Block creating new jobs
  - Show subscription renewal banner

- **Existing Jobs**: Should be handled based on business rules
  - Option A: Keep active until deadline (grace period)
  - Option B: Automatically pause all jobs
  - Option C: Close all jobs immediately

### 2. UI Warnings

- Show prominent banner on dashboard when subscription is expired
- Display warning when attempting to post new jobs
- Show days remaining before expiration (if in grace period)

### 3. Grace Period (Optional)

Consider implementing a grace period:
- Allow access for X days after expiration
- Show countdown timer
- Send reminder emails

## Implementation Status

### ✅ Currently Implemented:
- Subscription status tracking in database
- Webhook handler for subscription deletion
- Email notifications on cancellation
- Activity logging

### ❌ Not Yet Implemented:
- Access restrictions for expired subscriptions
- Job posting blocks
- UI warnings/banners
- Automatic job pausing/closing
- Grace period logic

## Database Fields Available

The `School` model has these subscription-related fields:
- `subscriptionId`: Stripe subscription ID
- `subscriptionStatus`: "active", "cancelled", "past_due", etc.
- `currentPeriodEnd`: When current billing period ends
- `cancelAtPeriodEnd`: Boolean flag if cancelled at period end
- `subscriptionEndDate`: When subscription actually ended

## Recommended Next Steps

1. **Add Access Checks**:
   - Create middleware/helper function to check subscription status
   - Apply to job creation endpoints
   - Apply to dashboard routes

2. **Add UI Warnings**:
   - Subscription status banner component
   - Warning modals for expired subscriptions
   - Disable job posting buttons when expired

3. **Implement Grace Period** (if desired):
   - Add `gracePeriodEnd` field to School model
   - Check grace period in access checks
   - Show countdown in UI

4. **Job Management**:
   - Decide on policy for existing jobs
   - Implement automatic pausing/closing if needed
   - Add manual override for admins

## Example Access Check Function

```javascript
// Helper function to check subscription access
async function checkSubscriptionAccess(schoolId) {
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: {
      subscriptionStatus: true,
      subscriptionEndDate: true,
      currentPeriodEnd: true,
    },
  });

  if (!school) {
    return { allowed: false, reason: "School not found" };
  }

  // Check if subscription is active
  if (school.subscriptionStatus === "active") {
    return { allowed: true };
  }

  // Check if subscription is cancelled/expired
  if (school.subscriptionStatus === "cancelled") {
    return {
      allowed: false,
      reason: "Subscription expired",
      message: "Your subscription has expired. Please renew to continue posting jobs.",
    };
  }

  // Check if past due
  if (school.subscriptionStatus === "past_due") {
    return {
      allowed: false,
      reason: "Payment past due",
      message: "Your payment is past due. Please update your payment method.",
    };
  }

  return { allowed: false, reason: "Unknown subscription status" };
}
```

## Testing Subscription Expiration

To test what happens when a subscription expires:

1. **In Stripe Dashboard**:
   - Go to the subscription
   - Cancel it immediately (or wait for natural expiration)
   - This triggers `customer.subscription.deleted` webhook

2. **Check Database**:
   - Verify `subscriptionStatus` is set to `"cancelled"`
   - Verify `subscriptionEndDate` is set

3. **Test Access**:
   - Try to create a new job posting
   - Check if dashboard shows warnings
   - Verify existing jobs are still accessible (or not, depending on policy)

## Related Files

- `api/webhooks/stripe.js` - Webhook handlers
- `api/jobs/index.js` - Job creation endpoint (needs subscription check)
- `api/subscription-details.js` - Subscription info endpoint
- `src/pages/schools/SubscriptionPage.tsx` - Subscription management UI
- `src/pages/schools/DashboardPage.tsx` - Dashboard (needs warning banner)

