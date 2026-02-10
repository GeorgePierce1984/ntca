import Stripe from "stripe";
import jwt from "jsonwebtoken";
import { prisma } from "./_utils/prisma.js";
import { isDemoPremiumEmail } from "./_utils/demo-premium.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded?.userType !== "SCHOOL") {
      return res.status(403).json({ error: "School access required" });
    }

    // Use the origin header or fallback to the production domain
    const baseUrl =
      req.headers.origin ||
      "https://ntca-bvqxecsr4-rogit85s-projects.vercel.app";

    const { customerId: requestedCustomerId, returnUrl } = req.body || {};

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        stripeCustomerId: true,
        userType: true,
        school: {
          select: {
            id: true,
            subscriptionId: true,
            subscriptionStatus: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Demo premium accounts don't have (or need) a Stripe portal
    if (isDemoPremiumEmail(user.email)) {
      return res.status(200).json({
        url: returnUrl || `${baseUrl}/schools/subscription?demo=1`,
        demo: true,
      });
    }

    // Determine Stripe customer id (ignore spoofed customerId values from the client)
    let customerId = user.stripeCustomerId || null;
    if (!customerId && requestedCustomerId && typeof requestedCustomerId === "string") {
      // Only accept client-supplied customerId if it matches what's on the user
      if (user.stripeCustomerId && user.stripeCustomerId === requestedCustomerId) {
        customerId = requestedCustomerId;
      }
    }

    // If we don't have one in DB, try to find by email (helps when webhook didn't persist stripeCustomerId)
    if (!customerId && user.email) {
      try {
        const existing = await stripe.customers.list({ email: user.email, limit: 1 });
        const found = existing?.data?.[0];
        if (found?.id) {
          customerId = found.id;
          await prisma.user.update({
            where: { id: user.id },
            data: { stripeCustomerId: customerId },
          });
        }
      } catch (e) {
        console.error("Stripe customer lookup failed:", e);
      }
    }

    if (!customerId) {
      return res.status(404).json({
        error: "No subscription found",
        code: "NO_STRIPE_CUSTOMER",
      });
    }

    const createPortalSession = async (stripeCustomerId) => {
      return await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: returnUrl || `${baseUrl}/schools/dashboard`,
      });
    };

    // Create a Stripe Customer Portal session (with recovery if DB has a stale customer id)
    try {
      const session = await createPortalSession(customerId);
      return res.status(200).json({ url: session.url });
    } catch (portalError) {
      // Typical when switching Test -> Live: DB may contain a test-mode customer id.
      const isMissingCustomer =
        portalError?.code === "resource_missing" &&
        (portalError?.param === "customer" ||
          portalError?.message?.toLowerCase?.().includes("no such customer"));

      if (!isMissingCustomer || !user.email) {
        throw portalError;
      }

      console.error("Stale Stripe customer id detected, attempting recovery by email...", {
        userId: user.id,
        email: user.email,
        stripeCustomerId: customerId,
      });

      // Attempt to find a valid customer in the CURRENT Stripe environment
      let recoveredCustomerId = null;
      try {
        const existing = await stripe.customers.list({
          email: user.email,
          limit: 10,
        });
        recoveredCustomerId = existing?.data?.[0]?.id || null;
      } catch (e) {
        console.error("Stripe customer lookup (recovery) failed:", e);
      }

      if (!recoveredCustomerId) {
        // Clear stale customer id so subsequent calls don't repeatedly fail
        await prisma.user.update({
          where: { id: user.id },
          data: { stripeCustomerId: null },
        });

        return res.status(404).json({
          error: "No subscription found",
          code: "NO_STRIPE_CUSTOMER",
        });
      }

      // Persist recovered id and retry portal creation
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: recoveredCustomerId },
      });

      const session = await createPortalSession(recoveredCustomerId);
      return res.status(200).json({ url: session.url, recovered: true });
    }
  } catch (error) {
    console.error("Stripe portal error:", error);
    if (error?.name === "JsonWebTokenError" || error?.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    return res.status(500).json({
      error: "Internal Server Error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

