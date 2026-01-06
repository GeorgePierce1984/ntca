# Check Existing Stripe Webhook Configuration

## What to Verify

### 1. Check the Webhook URL
The endpoint URL should be:
```
https://ntca.vercel.app/api/webhooks/stripe
```
(Or your actual Vercel production URL)

**If the URL is different or wrong:**
- Click on the webhook
- Click "Update" or "Edit"
- Change the URL to the correct one
- Save

### 2. Check Required Events
The webhook MUST have these events selected:
- ✅ `checkout.session.completed` (CRITICAL - creates user accounts)
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

**If events are missing:**
- Click on the webhook
- Click "Update" or "Edit"
- Add the missing events (especially `checkout.session.completed`)
- Save

### 3. Check Webhook Status
- Should be **"Enabled"** (not disabled)
- Should show recent activity if registrations happened

### 4. Get the Webhook Secret
1. Click on the webhook endpoint
2. Find "Signing secret" section
3. Click "Reveal"
4. Copy the secret (starts with `whsec_`)

### 5. Verify Secret in Vercel
1. Go to: https://vercel.com/george-pierces-projects/ntca/settings/environment-variables
2. Find `STRIPE_WEBHOOK_SECRET`
3. Verify it matches the secret from Stripe
4. If it doesn't exist or is wrong, update it

### 6. Check Recent Webhook Attempts
1. In Stripe, click on your webhook
2. Scroll to "Webhook attempts" or "Recent events"
3. Check for:
   - Recent attempts (if school registrations happened)
   - Status codes (200 = success, 500 = error)
   - Response times

### 7. Test vs Live Mode
**Important**: You found the webhook in "Dev" mode
- This is likely **Test Mode** in Stripe
- You may also need a webhook for **Live Mode** (production)
- Check the toggle in top right of Stripe Dashboard
- Create separate webhooks for Test and Live if needed

## Quick Checklist

- [ ] Webhook URL is correct
- [ ] `checkout.session.completed` event is selected
- [ ] Webhook is enabled
- [ ] Webhook secret is copied
- [ ] `STRIPE_WEBHOOK_SECRET` is set in Vercel
- [ ] Secret matches between Stripe and Vercel
- [ ] Check if you need a Live mode webhook too

## Next Steps

1. **If webhook looks correct**: Test it and verify it's working
2. **If webhook needs updates**: Update URL/events and save
3. **If secret is missing in Vercel**: Add it and redeploy
4. **If in Test mode**: Consider if you also need Live mode webhook

