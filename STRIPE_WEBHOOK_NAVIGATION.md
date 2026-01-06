# Stripe Webhook Navigation - Alternative Methods

## Method 1: Direct URL

Try going directly to the webhooks page:
- **Test Mode**: https://dashboard.stripe.com/test/webhooks
- **Live Mode**: https://dashboard.stripe.com/webhooks

## Method 2: Step-by-Step Navigation

1. **Login to Stripe Dashboard**
   - Go to: https://dashboard.stripe.com

2. **Click "Developers" in the left sidebar**
   - It's usually near the bottom of the sidebar
   - Icon looks like a code bracket or tools icon

3. **Click "Webhooks"**
   - Should be directly under "Developers"
   - Or look for "Webhooks" in the submenu

4. **Look for these buttons:**
   - "Add endpoint" (top right)
   - "Create endpoint" (top right)
   - "+" button (top right)
   - "New endpoint" button

## Method 3: If You See Existing Webhooks

If you see a list of webhooks (even if empty):
- Look for a **"+"** button in the top right
- Or a **"Create"** button
- Or **"Add webhook"** button

## Method 4: Check Your View

Make sure you're looking at:
- The main webhooks page (not webhook details)
- The correct mode (Test vs Live - toggle in top right)
- Full screen (not a modal or popup)

## Method 5: Alternative UI Locations

The button might be:
- Top right corner of the page
- Above the webhooks list
- In a toolbar/header area
- As a floating action button

## What the Page Should Look Like

You should see:
- A page title: "Webhooks" or "Webhook endpoints"
- Possibly an empty state saying "No webhooks" or "Get started"
- A button to create/add a webhook

## If Still Can't Find It

1. **Check your Stripe account permissions**
   - Make sure you have admin/owner access
   - Some roles can't create webhooks

2. **Try a different browser**
   - Sometimes UI elements don't load properly

3. **Check if you're in the right Stripe account**
   - Make sure you're logged into the correct account

4. **Look for "API" section**
   - Sometimes webhooks are under "API" instead of "Developers"

## Screenshot Locations to Check

Look for buttons in these areas:
- **Top right**: Usually where "Add" buttons are
- **Center of page**: If it's an empty state
- **Left sidebar**: Under Developers → Webhooks
- **Header/toolbar**: Above the main content

## Quick Alternative: Use Stripe CLI

If the web UI isn't working, you can also create webhooks via Stripe CLI, but the dashboard method is usually easier.

