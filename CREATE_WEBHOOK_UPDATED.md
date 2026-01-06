# Create Stripe Webhook - Updated Instructions

## 🎯 Updated Steps (Stripe UI May Have Changed)

### Step 1: Go Directly to Webhooks Page

**Direct Links:**
- **Test Mode**: https://dashboard.stripe.com/test/webhooks
- **Live Mode**: https://dashboard.stripe.com/webhooks

### Step 2: Look for These Button Names

Stripe may have updated their UI. Look for **ANY** of these buttons:
- ✅ **"Add destination"** (newer UI)
- ✅ **"Add endpoint"** (older UI)
- ✅ **"Create endpoint"**
- ✅ **"New webhook"**
- ✅ **"+"** (plus icon, usually top right)
- ✅ **"Create"** button

### Step 3: If You See an Empty State

If the page shows "No webhooks" or "Get started":
- Look for a **"Get started"** button
- Or a **"Create your first webhook"** button
- Click that to begin

### Step 4: Navigation Path (If Direct Link Doesn't Work)

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com
2. **Click "Developers"** in the left sidebar
3. **Click "Webhooks"** (should be under Developers)
4. **Look for any create/add button** in the top right area

### Step 5: What to Enter

Once you find the button and click it, you'll see a form:

1. **Endpoint URL** (or Destination URL):
   ```
   https://ntca.vercel.app/api/webhooks/stripe
   ```

2. **Description** (optional):
   ```
   NTCA School Registration
   ```

3. **Select Events** - Make sure to select:
   - ✅ `checkout.session.completed` (MOST IMPORTANT)
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

4. **Click "Add endpoint"** or **"Save"** or **"Create"**

### Step 6: Get the Webhook Secret

After creating:
1. You'll see the webhook details page
2. Look for **"Signing secret"** section
3. Click **"Reveal"** or **"Show"**
4. **Copy the secret** (starts with `whsec_`)

### Step 7: Add to Vercel

1. Go to: https://vercel.com/george-pierces-projects/ntca/settings/environment-variables
2. Click **"Add New"**
3. **Key**: `STRIPE_WEBHOOK_SECRET`
4. **Value**: Paste the secret from Step 6
5. **Environments**: Select all (Production, Preview, Development)
6. Click **"Save"**

### Step 8: Redeploy

1. Go to Vercel → Deployments
2. Click ⋯ on latest deployment
3. Click **"Redeploy"**

## 🔍 Still Can't Find the Button?

### Check These:

1. **Account Permissions**
   - Make sure you're logged in as an admin/owner
   - Some roles can't create webhooks

2. **Mode Toggle**
   - Check the toggle in top right (Test/Live)
   - Make sure you're in the mode you want

3. **Page Refresh**
   - Try refreshing the page (Cmd+R or F5)
   - Sometimes UI doesn't load properly

4. **Different Browser**
   - Try Chrome, Firefox, or Safari
   - Sometimes browser extensions block UI elements

5. **Mobile vs Desktop**
   - The webhook creation might only be available on desktop view
   - Try on a computer if you're on mobile

## 📸 What You Should See

The webhooks page should show:
- A list of webhooks (or empty state)
- A button to add/create webhooks (top right area)
- Possibly a search/filter bar

## 🆘 If Nothing Works

Contact Stripe Support:
- https://support.stripe.com/
- They can help with account-specific issues

Or try Stripe CLI (alternative method):
```bash
stripe webhooks create \
  --url https://ntca.vercel.app/api/webhooks/stripe \
  --events checkout.session.completed
```

