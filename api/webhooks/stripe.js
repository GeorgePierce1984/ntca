import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";
import { buffer } from "micro";
import { emailHelpers } from "../../lib/email/email-service.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// Create Prisma client with connection pooling for serverless
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error', 'warn'],
  errorFormat: 'pretty',
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    const buf = await buffer(req);
    const rawBody = buf.toString("utf8");

    if (!endpointSecret) {
      console.log(
        "Warning: STRIPE_WEBHOOK_SECRET not set, skipping signature verification",
      );
      // Parse event without signature verification for development
      event = JSON.parse(rawBody);
    } else {
      event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    }
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        await handleSuccessfulPayment(session);
        break;
      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;
      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object);
        break;
      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;
      case "customer.subscription.trial_will_end":
        await handleTrialWillEnd(event.data.object);
        break;
      case "invoice.upcoming":
        await handleInvoiceUpcoming(event.data.object);
        break;
      case "charge.dispute.created":
        await handleDisputeCreated(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      meta: error.meta
    });
    res.status(500).json({ 
      error: "Webhook processing failed",
      message: error.message,
      code: error.code,
      // Include more details in development
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        meta: error.meta
      })
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function handleSuccessfulPayment(session) {
  try {
    console.log("Processing successful payment:", session.id);
    console.log("Session metadata:", session.metadata);

    const metadata = session.metadata;
    if (!metadata) {
      console.error("Missing metadata in session:", session.id);
      return;
    }

    // Get form data from metadata (it was stringified JSON)
    let formData;
    try {
      formData = JSON.parse(metadata.formData || "{}");
    } catch (error) {
      console.error("Error parsing formData from metadata:", error);
      formData = {};
    }

    if (formData?.termsAccepted !== true) {
      console.error("❌ Terms not accepted - refusing account creation for session:", session.id);
      return;
    }

    // Normalize field names: map 'address' to 'streetAddress' if needed
    if (formData.address && !formData.streetAddress) {
      formData.streetAddress = formData.address;
    }

    // Capitalize country name properly (convert "kazakhstan" -> "Kazakhstan")
    if (formData.country) {
      const countryValue = formData.country.toLowerCase();
      const countryMap = {
        "kazakhstan": "Kazakhstan",
        "uzbekistan": "Uzbekistan",
        "kyrgyzstan": "Kyrgyzstan",
        "tajikistan": "Tajikistan",
        "turkmenistan": "Turkmenistan",
        "afghanistan": "Afghanistan",
        "mongolia": "Mongolia",
        "azerbaijan": "Azerbaijan",
        "georgia": "Georgia",
        "armenia": "Armenia",
      };
      formData.country = countryMap[countryValue] || formData.country.charAt(0).toUpperCase() + formData.country.slice(1);
    }

    const email = formData.email || session.customer_email;
    const userType = metadata.userType || "school";

    if (!email) {
      console.error("Missing email in form data:", formData);
      return;
    }

    console.log("Processing registration for:", email, "userType:", userType);

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      console.log("User already exists:", email);
      // Update subscription ID if needed
      if (userType.toLowerCase() === "school") {
        // Check if school profile exists first
        const existingSchool = await prisma.school.findUnique({
          where: { userId: user.id },
        });
        
        if (existingSchool) {
          // School exists, update it
          await prisma.school.update({
            where: { userId: user.id },
            data: { subscriptionId: session.subscription || session.id },
          });
          console.log("✅ Updated existing school subscription");
        } else {
          // School doesn't exist, create it from form data
          console.log("⚠️  User exists but school profile missing, creating school...");
          const bcrypt = await import("bcryptjs");
          const hashedPassword = formData.password
            ? await bcrypt.hash(formData.password, 12)
            : null;
          
          // Update user password if provided
          if (hashedPassword) {
            await prisma.user.update({
              where: { id: user.id },
              data: { password: hashedPassword },
            });
          }
          
          // Create school profile
          await prisma.school.create({
            data: {
              userId: user.id,
              name: formData.name || "",
              contactName: formData.contactName || "",
              contactEmail: formData.contactEmail || null,
              telephone: formData.telephone || "",
              phoneCountryCode: formData.phoneCountryCode || "+1",
              streetAddress: formData.streetAddress || formData.address || "",
              city: formData.city || "",
              state: formData.state || null,
              postalCode: formData.postalCode || "",
              country: formData.country || "",
              schoolType: formData.schoolType || "private",
              estimateJobs: formData.estimateJobs || "",
              website: formData.website || null,
              description: formData.description || null, // Optional - can be set later
              established: formData.established
                ? new Date(formData.established)
                : null,
              studentCount: formData.studentCount
                ? parseInt(formData.studentCount)
                : null,
              subscriptionId: session.subscription || session.id,
              verified: true,
            },
          });
          console.log("✅ Created missing school profile");
        }
      }
      return;
    }

    // Hash the password from form data
    const bcrypt = await import("bcryptjs");
    const hashedPassword = formData.password
      ? await bcrypt.hash(formData.password, 12)
      : null;

    // Create user first, then school (split to avoid transaction timeout)
    let newUser;
    let profile;
    
    try {
      console.log("🔄 Creating user...");
      newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          userType: userType.toUpperCase(),
          stripeCustomerId: session.customer,
        },
      });

      console.log("✅ User created:", newUser.id);
    } catch (userError) {
      console.error("❌ Failed to create user:", userError);
      throw new Error(`Failed to create user: ${userError.message}`);
    }

    // Create school profile separately
    try {
      console.log("🔄 Creating school profile...");
      profile = await prisma.school.create({
        data: {
          userId: newUser.id,
          name: formData.name || "",
          contactName: formData.contactName || "",
          contactEmail: formData.contactEmail || null,
          telephone: formData.telephone || "",
          phoneCountryCode: formData.phoneCountryCode || "+1",
          streetAddress: formData.streetAddress || formData.address || "",
          city: formData.city || "",
          state: formData.state || null,
          postalCode: formData.postalCode || "",
          country: formData.country || "",
          schoolType: formData.schoolType || "private",
          estimateJobs: formData.estimateJobs || "",
          website: formData.website || null,
          description: formData.description || null, // Optional - can be set later or from job posting
          established: formData.established
            ? new Date(formData.established)
            : null,
          studentCount: formData.studentCount
            ? parseInt(formData.studentCount)
            : null,
          subscriptionId: session.subscription || session.id,
          verified: true, // Stripe payment means verified
        },
      });

      console.log("✅ School created:", profile.id);
    } catch (schoolError) {
      console.error("❌ Failed to create school, user was created:", newUser.id);
      console.error("School creation error:", schoolError);
      console.error("Error details:", {
        message: schoolError.message,
        code: schoolError.code,
        meta: schoolError.meta
      });
      
      // Try to clean up the user if school creation failed
      try {
        await prisma.user.delete({
          where: { id: newUser.id },
        });
        console.log("✅ Cleaned up orphaned user");
      } catch (cleanupError) {
        console.error("⚠️  Failed to clean up user:", cleanupError);
        // Log this for manual cleanup
        console.error("⚠️  ORPHANED USER - Manual cleanup needed:", {
          userId: newUser.id,
          email: newUser.email,
          sessionId: session.id
        });
      }
      
      throw new Error(`Failed to create school: ${schoolError.message}. User was created but has been cleaned up.`);
    }

    const result = { user: newUser, profile };

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: result.user.id,
        action: "USER_REGISTERED_VIA_STRIPE",
        details: {
          sessionId: session.id,
          userType,
          email,
          planName: metadata.planName,
          billingType: metadata.billingType,
        },
      },
    });

    console.log(
      "✅ Successfully created user from Stripe payment:",
      result.user.id,
    );
    console.log("✅ User email:", result.user.email);
    console.log("✅ School ID:", result.profile.id);
    console.log("✅ School name:", result.profile.name);

    // Send welcome email
    try {
      await emailHelpers.sendSchoolWelcome(result.profile, {
        name: metadata.planName,
        jobLimit: metadata.jobLimit || "Unlimited",
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }
  } catch (error) {
    console.error("Error handling successful payment:", error);
    console.error("Error stack:", error.stack);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    
    // If it's a connection error, try to reconnect and retry once
    if (error.message.includes("Engine was empty") || 
        error.message.includes("connection") ||
        error.code === "P1001" || 
        error.code === "P1017" ||
        error.code === "P1008") {
      console.log("🔄 Connection error detected, attempting to reconnect...");
      try {
        await prisma.$disconnect();
        // Wait a bit before reconnecting
        await new Promise(resolve => setTimeout(resolve, 1000));
        await prisma.$connect();
        console.log("✅ Database reconnected, but transaction may have failed");
        console.log("⚠️  User may have been created but school was not");
      } catch (reconnectError) {
        console.error("❌ Failed to reconnect:", reconnectError);
      }
    }
    
    // Re-throw the error so the main handler knows it failed
    throw error;
  }
}

// Handle subscription created
async function handleSubscriptionCreated(subscription) {
  try {
    console.log("Processing subscription created:", subscription.id);

    const user = await getUserByStripeCustomerId(subscription.customer);
    if (!user) {
      console.log("User not found for customer:", subscription.customer);
      return;
    }

    // Check if school exists before updating
    const school = await prisma.school.findUnique({
      where: { userId: user.id },
    });

    if (school) {
      await prisma.school.update({
        where: { userId: user.id },
        data: {
          subscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
      });
    } else {
      console.log("⚠️  School profile not found for user:", user.id);
      return;
    }

    await logActivity(user.id, "SUBSCRIPTION_CREATED", {
      subscriptionId: subscription.id,
      status: subscription.status,
    });

    // Send subscription confirmation email
    try {
      const school = await prisma.school.findUnique({
        where: { userId: user.id },
        include: { user: true },
      });

      if (school) {
        const planDetails = {
          name: subscription.items.data[0]?.price.nickname || "Subscription",
          jobLimit:
            subscription.items.data[0]?.price.metadata?.jobLimit || "Unlimited",
          price: `$${(subscription.items.data[0]?.price.unit_amount / 100).toFixed(2)}`,
          nextBillingDate: new Date(
            subscription.current_period_end * 1000,
          ).toLocaleDateString(),
        };

        await emailHelpers.sendSubscriptionChanged(
          school,
          "activated",
          planDetails,
        );
      }
    } catch (emailError) {
      console.error("Failed to send subscription created email:", emailError);
    }
  } catch (error) {
    console.error("Error handling subscription created:", error);
  }
}

// Handle subscription updated
async function handleSubscriptionUpdated(subscription) {
  try {
    console.log("Processing subscription updated:", subscription.id);

    const user = await getUserByStripeCustomerId(subscription.customer);
    if (!user) return;

    // Check if school exists before updating
    const school = await prisma.school.findUnique({
      where: { userId: user.id },
    });

    if (school) {
      await prisma.school.update({
        where: { userId: user.id },
        data: {
          subscriptionStatus: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
        },
      });
    } else {
      console.log("⚠️  School profile not found for user:", user.id);
      return;
    }

    await logActivity(user.id, "SUBSCRIPTION_UPDATED", {
      subscriptionId: subscription.id,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });

    // Send subscription update email
    try {
      const school = await prisma.school.findUnique({
        where: { userId: user.id },
        include: { user: true },
      });

      if (school && subscription.items.data[0]) {
        const planDetails = {
          name: subscription.items.data[0].price.nickname || "Subscription",
          jobLimit:
            subscription.items.data[0].price.metadata?.jobLimit || "Unlimited",
          price: `$${(subscription.items.data[0].price.unit_amount / 100).toFixed(2)}`,
          nextBillingDate: new Date(
            subscription.current_period_end * 1000,
          ).toLocaleDateString(),
        };

        const action = subscription.cancel_at_period_end
          ? "scheduled for cancellation"
          : "updated";
        await emailHelpers.sendSubscriptionChanged(school, action, planDetails);
      }
    } catch (emailError) {
      console.error("Failed to send subscription updated email:", emailError);
    }
  } catch (error) {
    console.error("Error handling subscription updated:", error);
  }
}

// Handle subscription deleted/cancelled
async function handleSubscriptionDeleted(subscription) {
  try {
    console.log("Processing subscription deleted:", subscription.id);

    const user = await getUserByStripeCustomerId(subscription.customer);
    if (!user) return;

    // Check if school exists before updating
    const school = await prisma.school.findUnique({
      where: { userId: user.id },
    });

    if (school) {
      // Pause all active jobs when subscription expires
      const pausedJobs = await prisma.job.updateMany({
        where: {
          schoolId: school.id,
          status: "ACTIVE",
        },
        data: {
          status: "PAUSED",
        },
      });

      console.log(`✅ Paused ${pausedJobs.count} active jobs for expired subscription`);

      await prisma.school.update({
        where: { userId: user.id },
        data: {
          subscriptionStatus: "cancelled",
          subscriptionEndDate: new Date(),
        },
      });

      // Log job pausing activity
      await logActivity(user.id, "JOBS_PAUSED_ON_EXPIRATION", {
        subscriptionId: subscription.id,
        jobsPaused: pausedJobs.count,
      });
    } else {
      console.log("⚠️  School profile not found for user:", user.id);
      return;
    }

    await logActivity(user.id, "SUBSCRIPTION_CANCELLED", {
      subscriptionId: subscription.id,
      cancelReason: subscription.cancellation_details?.reason || "unknown",
    });

    // Send subscription cancelled email
    try {
      const school = await prisma.school.findUnique({
        where: { userId: user.id },
        include: { user: true },
      });

      if (school) {
        const planDetails = {
          name: "Cancelled",
          jobLimit: "0",
          price: "$0",
          nextBillingDate: "N/A",
        };

        await emailHelpers.sendSubscriptionChanged(
          school,
          "cancelled",
          planDetails,
        );
      }
    } catch (emailError) {
      console.error("Failed to send subscription cancelled email:", emailError);
    }
  } catch (error) {
    console.error("Error handling subscription deleted:", error);
  }
}

// Handle successful payment
async function handlePaymentSucceeded(invoice) {
  try {
    console.log("Processing payment succeeded:", invoice.id);

    const user = await getUserByStripeCustomerId(invoice.customer);
    if (!user) return;

    await logActivity(user.id, "PAYMENT_SUCCEEDED", {
      invoiceId: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
    });

    // Update subscription status if it was past due
    if (invoice.subscription) {
      const school = await prisma.school.findUnique({
        where: { userId: user.id },
      });
      
      if (school) {
        await prisma.school.update({
          where: { userId: user.id },
          data: {
            subscriptionStatus: "active",
          },
        });
      } else {
        console.log("⚠️  School profile not found for user:", user.id);
      }
    }
  } catch (error) {
    console.error("Error handling payment succeeded:", error);
  }
}

// Handle failed payment
async function handlePaymentFailed(invoice) {
  try {
    console.log("Processing payment failed:", invoice.id);

    const user = await getUserByStripeCustomerId(invoice.customer);
    if (!user) return;

    // Check if school exists before updating
    const school = await prisma.school.findUnique({
      where: { userId: user.id },
    });

    if (school) {
      await prisma.school.update({
        where: { userId: user.id },
        data: {
          subscriptionStatus: "past_due",
        },
      });
    } else {
      console.log("⚠️  School profile not found for user:", user.id);
      return;
    }

    await logActivity(user.id, "PAYMENT_FAILED", {
      invoiceId: invoice.id,
      amount: invoice.amount_due,
      error: invoice.last_payment_error?.message || "Payment failed",
    });
  } catch (error) {
    console.error("Error handling payment failed:", error);
  }
}

// Handle trial ending soon
async function handleTrialWillEnd(subscription) {
  try {
    console.log("Processing trial will end:", subscription.id);

    const user = await getUserByStripeCustomerId(subscription.customer);
    if (!user) return;

    await logActivity(user.id, "TRIAL_ENDING_SOON", {
      subscriptionId: subscription.id,
      trialEnd: new Date(subscription.trial_end * 1000),
    });

    // Send trial ending email
    try {
      const school = await prisma.school.findUnique({
        where: { userId: user.id },
        include: { user: true },
      });

      if (school) {
        const trialEndDate = new Date(subscription.trial_end * 1000);
        const daysRemaining = Math.ceil(
          (trialEndDate - new Date()) / (1000 * 60 * 60 * 24),
        );

        // Send email using the subscription changed template with custom message
        const planDetails = {
          name: subscription.items.data[0]?.price.nickname || "Trial",
          jobLimit:
            subscription.items.data[0]?.price.metadata?.jobLimit || "Unlimited",
          price: `$${(subscription.items.data[0]?.price.unit_amount / 100).toFixed(2)}`,
          nextBillingDate: trialEndDate.toLocaleDateString(),
        };

        await emailHelpers.sendSubscriptionChanged(
          school,
          `trial ending in ${daysRemaining} days`,
          planDetails,
        );
      }
    } catch (emailError) {
      console.error("Failed to send trial ending email:", emailError);
    }
  } catch (error) {
    console.error("Error handling trial will end:", error);
  }
}

// Handle upcoming invoice
async function handleInvoiceUpcoming(invoice) {
  try {
    // Validate invoice object
    if (!invoice) {
      console.error("handleInvoiceUpcoming: invoice object is missing");
      return;
    }

    // Handle case where invoice might be nested or have different structure
    // Stripe sometimes sends expanded objects or different formats
    let invoiceId = invoice.id;
    let customerId = invoice.customer;
    const invoiceNumber = invoice.number; // Human-readable invoice number
    
    // If id is missing, use number as fallback identifier
    // This can happen with certain Stripe webhook formats or expanded objects
    if (!invoiceId && invoice.object === 'invoice') {
      if (invoiceNumber) {
        // Use invoice number as identifier (e.g., "INV-1234")
        invoiceId = `number:${invoiceNumber}`;
        console.warn("handleInvoiceUpcoming: Using invoice number as fallback identifier", {
          invoiceNumber: invoiceNumber,
          customerId: customerId,
        });
      } else {
        // If we have customer, we can still process but log a warning
        if (customerId) {
          invoiceId = `customer:${customerId}`;
          console.warn("handleInvoiceUpcoming: No invoice ID or number found, using customer ID as identifier", {
            customerId: customerId,
          });
        } else {
          console.error("handleInvoiceUpcoming: Cannot process invoice without ID, number, or customer", {
            invoiceKeys: Object.keys(invoice),
            invoiceType: typeof invoice,
          });
          return;
        }
      }
    }

    if (!invoiceId) {
      console.error("handleInvoiceUpcoming: invoice.id is missing and no fallback available", {
        invoiceKeys: invoice ? Object.keys(invoice) : "invoice is null/undefined",
        invoiceType: typeof invoice,
        hasNumber: !!invoice.number,
        hasCustomer: !!invoice.customer,
      });
      return;
    }

    if (!customerId) {
      console.error("handleInvoiceUpcoming: invoice.customer is missing", {
        invoiceId: invoiceId,
      });
      return;
    }

    console.log("Processing invoice upcoming:", invoiceId, invoiceNumber ? `(Invoice #${invoiceNumber})` : '');

    const user = await getUserByStripeCustomerId(customerId);
    if (!user) return;

    await logActivity(user.id, "INVOICE_UPCOMING", {
      invoiceId: invoiceId,
      amount: invoice.amount_due,
      dueDate: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
    });

    // Send renewal reminder email
    try {
      const school = await prisma.school.findUnique({
        where: { userId: user.id },
        include: { user: true },
      });

      if (school) {
        const renewalDate = new Date(invoice.period_end * 1000);
        const planDetails = {
          name: "Current Plan",
          jobLimit: "See your dashboard",
          price: `$${(invoice.amount_due / 100).toFixed(2)}`,
          nextBillingDate: renewalDate.toLocaleDateString(),
        };

        await emailHelpers.sendSubscriptionChanged(
          school,
          "renewing soon",
          planDetails,
        );
      }
    } catch (emailError) {
      console.error("Failed to send renewal reminder email:", emailError);
    }
  } catch (error) {
    console.error("Error handling invoice upcoming:", error);
  }
}

// Handle dispute created
async function handleDisputeCreated(dispute) {
  try {
    console.log("Processing dispute created:", dispute.id);

    // Get charge to find customer
    const charge = await stripe.charges.retrieve(dispute.charge);
    const user = await getUserByStripeCustomerId(charge.customer);
    if (!user) return;

    // Check if school exists before updating
    const school = await prisma.school.findUnique({
      where: { userId: user.id },
    });

    if (school) {
      // Flag the account
      await prisma.school.update({
        where: { userId: user.id },
        data: {
          flagged: true,
          flagReason: "Payment dispute created",
        },
      });
    } else {
      console.log("⚠️  School profile not found for user:", user.id);
      return;
    }

    await logActivity(user.id, "DISPUTE_CREATED", {
      disputeId: dispute.id,
      amount: dispute.amount,
      reason: dispute.reason,
    });

    // TODO: Notify admins about dispute
  } catch (error) {
    console.error("Error handling dispute created:", error);
  }
}

// Helper function to get user by Stripe customer ID
async function getUserByStripeCustomerId(customerId) {
  if (!customerId) return null;

  try {
    return await prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
      include: { school: true },
    });
  } catch (error) {
    console.error("Error finding user by Stripe customer ID:", error);
    return null;
  }
}

// Helper function to log activities
async function logActivity(userId, action, details = {}) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        details,
      },
    });
  } catch (error) {
    console.error("Error logging activity:", error);
  }
}

// Disable body parsing for webhooks
