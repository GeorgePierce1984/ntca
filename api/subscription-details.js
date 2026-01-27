import Stripe from "stripe";
import jwt from "jsonwebtoken";
import { prisma } from "./_utils/prisma.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// Middleware to verify JWT token
function verifyToken(req) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) throw new Error("No token provided");
  return jwt.verify(token, process.env.JWT_SECRET);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const decoded = verifyToken(req);

    // Only schools can access this endpoint
    if (decoded.userType !== "SCHOOL") {
      return res.status(403).json({ error: "School access required" });
    }

    // Get school with subscription info (wrap in try-catch for Prisma connection errors)
    let school;
    try {
      school = await prisma.school.findUnique({
        where: { userId: decoded.userId },
        include: {
          user: {
            select: {
              stripeCustomerId: true,
            },
          },
        },
      });
    } catch (prismaError) {
      // Handle Prisma connection errors gracefully
      if (
        prismaError.message?.includes("Response from the Engine was empty") ||
        prismaError.message?.includes("Engine is not yet connected") ||
        prismaError.name === "PrismaClientUnknownRequestError"
      ) {
        console.error("Prisma connection error in subscription-details:", prismaError);
        return res.status(503).json({
          error: "Database connection error",
          message: "Unable to fetch subscription details. Please try again.",
        });
      }
      throw prismaError;
    }

    if (!school) {
      return res.status(404).json({ error: "School profile not found" });
    }

    // If no subscription ID, return basic info
    if (!school.subscriptionId) {
      return res.status(200).json({
        subscriptionId: null,
        subscriptionStatus: school.subscriptionStatus,
        currentPeriodStart: null,
        currentPeriodEnd: school.currentPeriodEnd,
        cancelAtPeriodEnd: school.cancelAtPeriodEnd,
        subscriptionEndDate: school.subscriptionEndDate,
        plan: null,
        billingCycle: null,
      });
    }

    // Fetch detailed subscription info from Stripe
    let stripeSubscription = null;
    let planDetails = null;

    try {
      stripeSubscription = await stripe.subscriptions.retrieve(
        school.subscriptionId,
        {
          expand: ["items.data.price.product"],
        }
      );

      // Extract plan information
      const price = stripeSubscription.items.data[0]?.price;
      if (price) {
        planDetails = {
          name: price.nickname || price.product?.name || "Subscription",
          amount: price.unit_amount / 100, // Convert from cents
          currency: price.currency.toUpperCase(),
          interval: price.recurring?.interval, // month or year
          intervalCount: price.recurring?.interval_count || 1,
        };
      }
    } catch (stripeError) {
      console.error("Error fetching Stripe subscription:", stripeError);
      // Continue with database data if Stripe fetch fails
    }

    // Return combined data
    return res.status(200).json({
      subscriptionId: school.subscriptionId,
      subscriptionStatus: school.subscriptionStatus || stripeSubscription?.status,
      currentPeriodStart: stripeSubscription
        ? new Date(stripeSubscription.current_period_start * 1000).toISOString()
        : null,
      currentPeriodEnd: school.currentPeriodEnd
        ? school.currentPeriodEnd.toISOString()
        : stripeSubscription
        ? new Date(stripeSubscription.current_period_end * 1000).toISOString()
        : null,
      cancelAtPeriodEnd: school.cancelAtPeriodEnd || stripeSubscription?.cancel_at_period_end || false,
      subscriptionEndDate: school.subscriptionEndDate
        ? school.subscriptionEndDate.toISOString()
        : null,
      plan: planDetails,
      billingCycle: planDetails?.interval || null,
      daysRemaining: stripeSubscription?.current_period_end
        ? Math.ceil(
            (stripeSubscription.current_period_end * 1000 - Date.now()) /
              (1000 * 60 * 60 * 24)
          )
        : null,
    });
  } catch (error) {
    console.error("Subscription details API error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }

    return res.status(500).json({
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
  // Don't manually disconnect - Prisma handles connections in serverless environments
}

