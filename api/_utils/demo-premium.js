/**
 * Demo premium allowlist
 *
 * Purpose: allow specific test/demo accounts to access premium features without Stripe.
 * Controlled via env var DEMO_PREMIUM_EMAILS (comma-separated), plus a safe built-in default.
 */

const DEFAULT_DEMO_PREMIUM_EMAILS = [
  "georgepierce@hotmail.comfytest",
];

export function isDemoPremiumEmail(email) {
  if (!email || typeof email !== "string") return false;

  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;

  const envList = (process.env.DEMO_PREMIUM_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const allowlist = envList.length ? envList : DEFAULT_DEMO_PREMIUM_EMAILS;
  return allowlist.includes(normalized);
}


