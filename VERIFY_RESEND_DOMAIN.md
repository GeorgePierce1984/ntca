# How to Verify Your Domain in Resend

## ⚠️ CRITICAL: Current Issue

**Resend's test domain (`onboarding@resend.dev`) can ONLY send emails to the account owner's email address.**

This is why only 1 email was sent in the last 15 days - all other emails are being blocked by Resend.

## ✅ Solution: Verify Your Custom Domain

### Step 1: Add Domain in Resend

1. **Go to Resend Dashboard**
   - Visit https://resend.com/domains
   - Click **"Add Domain"** button

2. **Enter Your Domain**
   - Domain: `nt-ca.com` (or `ntca.com` if you prefer)
   - Click **"Add Domain"**

### Step 2: Configure DNS Records

Resend will provide you with DNS records to add. You'll need to add these to your domain's DNS settings:

#### Required DNS Records:

1. **SPF Record** (TXT)
   - Name: `@` (or root domain)
   - Value: `v=spf1 include:resend.com ~all`

2. **DKIM Record** (TXT)
   - Name: `resend._domainkey` (or similar)
   - Value: (Provided by Resend - unique per domain)

3. **DMARC Record** (TXT) - Optional but recommended
   - Name: `_dmarc`
   - Value: `v=DMARC1; p=none; rua=mailto:dmarc@nt-ca.com`

#### Where to Add DNS Records:

- **If using Vercel DNS**: Go to Vercel Dashboard → Your Project → Settings → Domains → DNS Records
- **If using external DNS** (e.g., Cloudflare, Namecheap, GoDaddy):
  - Log into your DNS provider
  - Find DNS Management / DNS Records section
  - Add the records provided by Resend

### Step 3: Wait for Verification

- Resend will automatically verify your DNS records
- This usually takes 5-30 minutes
- Check status in Resend dashboard (should show "Verified" ✅)

### Step 4: Update Environment Variables

Once verified, add these to Vercel:

```bash
# Add EMAIL_FROM_ADDRESS (use your verified domain)
vercel env add EMAIL_FROM_ADDRESS production
# Enter: noreply@nt-ca.com

# Add EMAIL_REPLY_TO
vercel env add EMAIL_REPLY_TO production
# Enter: support@nt-ca.com

# Add EMAIL_FROM_NAME (optional, defaults to "NTCA Platform")
vercel env add EMAIL_FROM_NAME production
# Enter: NTCA Platform
```

**Or via Vercel Dashboard:**
1. Go to Vercel → Your Project → Settings → Environment Variables
2. Add:
   - `EMAIL_FROM_ADDRESS` = `noreply@nt-ca.com`
   - `EMAIL_REPLY_TO` = `support@nt-ca.com`
   - `EMAIL_FROM_NAME` = `NTCA Platform`
3. Select all environments (Production, Preview, Development)
4. Click **Save**

### Step 5: Redeploy

After adding environment variables, redeploy:

```bash
vercel --prod
```

Or via Vercel Dashboard:
- Go to Deployments
- Click "Redeploy" on latest deployment

### Step 6: Test

After redeployment, test email sending:

```bash
curl -X POST https://www.nt-ca.com/api/email/diagnose \
  -H "Content-Type: application/json" \
  -d '{"email":"your-test-email@gmail.com"}'
```

Or try registering a new account - verification emails should now be sent successfully!

## 📋 Quick Checklist

- [ ] Domain added in Resend dashboard
- [ ] DNS records (SPF, DKIM) added to domain
- [ ] Domain verified in Resend (shows ✅)
- [ ] `EMAIL_FROM_ADDRESS` set in Vercel to `noreply@nt-ca.com`
- [ ] `EMAIL_REPLY_TO` set in Vercel to `support@nt-ca.com`
- [ ] Application redeployed
- [ ] Test email sent successfully

## 🆘 Troubleshooting

### Domain Not Verifying?

1. **Check DNS Propagation**
   - Use https://dnschecker.org to verify DNS records are propagated globally
   - Can take up to 48 hours, but usually 5-30 minutes

2. **Verify Record Format**
   - Make sure TXT records are exactly as provided by Resend
   - No extra spaces or quotes
   - Case-sensitive for some values

3. **Check Resend Dashboard**
   - Look for specific error messages
   - Resend will tell you which records are missing/incorrect

### Still Having Issues?

- Check Resend documentation: https://resend.com/docs/dashboard/domains/introduction
- Contact Resend support if DNS records are correct but domain won't verify

## 🎯 After Verification

Once your domain is verified:
- ✅ Emails will send to ALL recipients (not just account owner)
- ✅ Better deliverability (less spam filtering)
- ✅ Professional sender address (`noreply@nt-ca.com` instead of `onboarding@resend.dev`)
- ✅ Higher email limits (Resend free tier: 3,000 emails/month)

