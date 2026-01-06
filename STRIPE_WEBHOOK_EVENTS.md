# Stripe Webhook Events Configuration Guide

This guide lists all the Stripe webhook events you should enable for the NTCA platform, organized by priority and category.

## 🚨 Critical Events (Must Have)

These events are essential for basic functionality:

### 1. **checkout.session.completed**
- **Priority**: CRITICAL
- **Purpose**: Creates user accounts after successful payment
- **When triggered**: After customer completes checkout
- **Required for**: Account creation, initial subscription setup

## 📊 Subscription Management Events (High Priority)

These events manage the subscription lifecycle:

### 2. **customer.subscription.created**
- **Priority**: HIGH
- **Purpose**: Track new subscription creation
- **When triggered**: When a new subscription is created
- **Use case**: Update user's subscription status, set access level

### 3. **customer.subscription.updated**
- **Priority**: HIGH
- **Purpose**: Handle plan changes, renewals, and status updates
- **When triggered**: Any subscription modification
- **Use case**: Plan upgrades/downgrades, renewal processing

### 4. **customer.subscription.deleted**
- **Priority**: HIGH
- **Purpose**: Handle subscription cancellations
- **When triggered**: When subscription is cancelled or expires
- **Use case**: Revoke access, update user status

## 💳 Payment & Billing Events (High Priority)

These events track payment success and failures:

### 5. **invoice.payment_succeeded**
- **Priority**: HIGH
- **Purpose**: Confirm recurring payments
- **When triggered**: Successful subscription payment
- **Use case**: Payment history, send receipts

### 6. **invoice.payment_failed**
- **Priority**: HIGH
- **Purpose**: Handle failed payments
- **When triggered**: Payment attempt fails
- **Use case**: Send payment failure notifications, retry logic

### 7. **payment_method.attached**
- **Priority**: MEDIUM
- **Purpose**: Track payment method updates
- **When triggered**: Customer adds/updates payment method
- **Use case**: Update payment method status

## 📅 Notification Events (Medium Priority)

These events help with customer communication:

### 8. **customer.subscription.trial_will_end**
- **Priority**: MEDIUM
- **Purpose**: Trial expiration warning
- **When triggered**: 3 days before trial ends
- **Use case**: Send reminder emails

### 9. **invoice.upcoming**
- **Priority**: MEDIUM
- **Purpose**: Renewal notifications
- **When triggered**: ~3 days before subscription renews
- **Use case**: Send renewal reminders

## 🔄 Advanced Subscription Events (Optional)

These events handle advanced subscription scenarios:

### 10. **customer.subscription.paused**
- **Priority**: LOW
- **Purpose**: Handle subscription pauses
- **When triggered**: If pause feature is enabled
- **Use case**: Temporarily restrict access

### 11. **customer.subscription.resumed**
- **Priority**: LOW
- **Purpose**: Handle subscription resumption
- **When triggered**: Paused subscription resumes
- **Use case**: Restore access

## 👤 Customer Management Events (Optional)

These events sync customer data:

### 12. **customer.updated**
- **Priority**: LOW
- **Purpose**: Sync customer data changes
- **When triggered**: Customer details updated in Stripe
- **Use case**: Update email, name, or other details

### 13. **customer.deleted**
- **Priority**: LOW
- **Purpose**: Handle customer deletion
- **When triggered**: Customer deleted from Stripe
- **Use case**: Clean up or archive user data

## ⚠️ Financial Risk Events (Recommended)

These events help manage financial risks:

### 14. **charge.dispute.created**
- **Priority**: MEDIUM
- **Purpose**: Handle chargebacks
- **When triggered**: Customer disputes a charge
- **Use case**: Flag account, notify admins

### 15. **charge.refunded**
- **Priority**: MEDIUM
- **Purpose**: Handle refunds
- **When triggered**: Charge is refunded
- **Use case**: Update access, track refunds

## Configuration Checklist

When setting up your webhook in Stripe Dashboard:

### Essential Events (Minimum Required):
- [ ] `checkout.session.completed`
- [ ] `customer.subscription.created`
- [ ] `customer.subscription.updated`
- [ ] `customer.subscription.deleted`
- [ ] `invoice.payment_succeeded`
- [ ] `invoice.payment_failed`

### Recommended Additional Events:
- [ ] `payment_method.attached`
- [ ] `customer.subscription.trial_will_end`
- [ ] `invoice.upcoming`
- [ ] `charge.dispute.created`
- [ ] `charge.refunded`

### Optional Events (Nice to Have):
- [ ] `customer.subscription.paused`
- [ ] `customer.subscription.resumed`
- [ ] `customer.updated`
- [ ] `customer.deleted`

## Implementation Status

Based on your current webhook handler:

✅ **Currently Handled**:
- `checkout.session.completed` - Creates user accounts
- `customer.subscription.created` - Logs event (needs full implementation)
- `customer.subscription.updated` - Logs event (needs full implementation)
- `customer.subscription.deleted` - Logs event (needs full implementation)

❌ **Not Yet Implemented**:
- All payment events
- All notification events
- All customer management events
- All financial risk events

## Database Schema Requirements

To fully implement all events, ensure your database has:

1. **User Table**:
   - `stripeCustomerId` field

2. **School Table**:
   - `subscriptionId`
   - `subscriptionStatus`
   - `currentPeriodEnd`
   - `cancelAtPeriodEnd`
   - `planTier`

3. **Payment History Table** (if tracking payments):
   ```prisma
   model Payment {
     id               String   @id @default(cuid())
     userId           String
     stripeInvoiceId  String   @unique
     amount           Int
     currency         String
     status           String
     failureReason    String?
     paymentDate      DateTime
     createdAt        DateTime @default(now())
   }
   ```

4. **Activity Log Table** (for audit trail):
   ```prisma
   model ActivityLog {
     id        String   @id @default(cuid())
     userId    String
     action    String
     details   Json?
     createdAt DateTime @default(now())
   }
   ```

## Testing Your Webhooks

1. **Use Stripe CLI for Local Testing**:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   stripe trigger checkout.session.completed
   ```

2. **Test in Production**:
   - Use Stripe test mode
   - Complete a test payment
   - Check webhook logs in Stripe Dashboard

3. **Monitor Webhook Health**:
   - Check Stripe Dashboard → Webhooks → Your endpoint
   - Look for successful deliveries
   - Monitor response times

## Security Best Practices

1. **Always verify webhook signatures** in production
2. **Make webhook handlers idempotent** (handle duplicate events)
3. **Process webhooks asynchronously** for better performance
4. **Log all webhook events** for debugging
5. **Set up webhook event replay** for failed events

## Next Steps

1. Enable the essential events in Stripe Dashboard
2. Implement missing event handlers in your code
3. Update database schema if needed
4. Test each event type thoroughly
5. Monitor webhook performance and errors