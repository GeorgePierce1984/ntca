import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";
import { buffer } from "micro";
import bcrypt from "bcryptjs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

const prisma = new PrismaClient();
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Disable body parsing for webhooks
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
      // ========== CHECKOUT & INITIAL PAYMENT ==========
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      // ========== SUBSCRIPTION LIFECYCLE ==========
      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;

      case "customer.subscription.paused":
        await handleSubscriptionPaused(event.data.object);
        break;

      case "customer.subscription.resumed":
        await handleSubscriptionResumed(event.data.object);
        break;

      case "customer.subscription.trial_will_end":
        await handleTrialWillEnd(event.data.object);
        break;

      // ========== PAYMENT & BILLING ==========
      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object);
        break;

      case "invoice.upcoming":
        await handleInvoiceUpcoming(event.data.object);
        break;

      case "payment_method.attached":
        await handlePaymentMethodAttached(event.data.object);
        break;

      // ========== CUSTOMER MANAGEMENT ==========
      case "customer.updated":
        await handleCustomerUpdated(event.data.object);
        break;

      case "customer.deleted":
        await handleCustomerDeleted(event.data.object);
        break;

      // ========== FINANCIAL EVENTS ==========
      case "charge.dispute.created":
        await handleDisputeCreated(event.data.object);
        break;

      case "charge.refunded":
        await handleChargeRefunded(event.data.object);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Log all events
    await logWebhookEvent(event);

    res.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  } finally {
    await prisma.$disconnect();
  }
}

// ========== EVENT HANDLERS ==========

async function handleCheckoutSessionCompleted(session) {
  try {
    console.log("Processing checkout.session.completed:", session.id);

    const metadata = session.metadata;
    if (!metadata || !metadata.formData) {
      console.error("Missing metadata in session:", session.id);
      return;
    }

    const formData = JSON.parse(metadata.formData || "{}");
    const email = formData.email || session.customer_email;
    const userType = metadata.userType || "school";

    if (!email) {
      console.error("Missing email in checkout session");
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("User already exists, updating subscription");
      await updateUserSubscription(existingUser.id, session);
      return;
    }

    // Create new user
    const hashedPassword = formData.password
      ? await bcrypt.hash(formData.password, 12)
      : null;

    await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          userType: userType.toUpperCase(),
          stripeCustomerId: session.customer,
        },
      });

      // Create school profile
      if (userType.toLowerCase() === "school") {
        await tx.school.create({
          data: {
            userId: user.id,
            name: formData.name || "",
            contactName: formData.contactName || "",
            contactEmail: formData.contactEmail || null,
            telephone: formData.telephone || "",
            phoneCountryCode: formData.phoneCountryCode || "+1",
            streetAddress: formData.streetAddress || "",
            city: formData.city || "",
            state: formData.state || null,
            postalCode: formData.postalCode || "",
            country: formData.country || "",
            schoolType: formData.schoolType || "private",
            estimateJobs: formData.estimateJobs || "",
            website: formData.website || null,
            description: formData.description || null,
            subscriptionId: session.subscription,
            verified: true,
            planTier: metadata.planName || "starter",
          },
        });
      }

      // Log activity
      await tx.activityLog.create({
        data: {
          userId: user.id,
          action: "ACCOUNT_CREATED",
          details: {
            sessionId: session.id,
            userType,
            planName: metadata.planName,
            billingType: metadata.billingType,
          },
        },
      });
    });

    console.log("Successfully created user from checkout session");
  } catch (error) {
    console.error("Error handling checkout session:", error);
    throw error;
  }
}

async function handleSubscriptionCreated(subscription) {
  console.log("Processing customer.subscription.created:", subscription.id);

  const user = await getUserByStripeCustomerId(subscription.customer);
  if (!user) return;

  await prisma.school.update({
    where: { userId: user.id },
    data: {
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });

  await logActivity(user.id, "SUBSCRIPTION_CREATED", {
    subscriptionId: subscription.id,
    status: subscription.status,
  });
}

async function handleSubscriptionUpdated(subscription) {
  console.log("Processing customer.subscription.updated:", subscription.id);

  const user = await getUserByStripeCustomerId(subscription.customer);
  if (!user) return;

  const previousAttributes = subscription.previous_attributes || {};

  await prisma.school.update({
    where: { userId: user.id },
    data: {
      subscriptionStatus: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  // Check for plan changes
  if (previousAttributes.items) {
    await logActivity(user.id, "SUBSCRIPTION_PLAN_CHANGED", {
      subscriptionId: subscription.id,
      previousPlan: previousAttributes.items?.data?.[0]?.price?.id,
      newPlan: subscription.items.data[0].price.id,
    });
  }

  // Check for status changes
  if (previousAttributes.status) {
    await logActivity(user.id, "SUBSCRIPTION_STATUS_CHANGED", {
      subscriptionId: subscription.id,
      previousStatus: previousAttributes.status,
      newStatus: subscription.status,
    });
  }
}

async function handleSubscriptionDeleted(subscription) {
  console.log("Processing customer.subscription.deleted:", subscription.id);

  const user = await getUserByStripeCustomerId(subscription.customer);
  if (!user) return;

  await prisma.school.update({
    where: { userId: user.id },
    data: {
      subscriptionStatus: "cancelled",
      subscriptionEndDate: new Date(),
    },
  });

  await logActivity(user.id, "SUBSCRIPTION_CANCELLED", {
    subscriptionId: subscription.id,
    cancelReason: subscription.cancellation_details?.reason,
  });

  // TODO: Send cancellation email
}

async function handleSubscriptionPaused(subscription) {
  console.log("Processing customer.subscription.paused:", subscription.id);

  const user = await getUserByStripeCustomerId(subscription.customer);
  if (!user) return;

  await prisma.school.update({
    where: { userId: user.id },
    data: {
      subscriptionStatus: "paused",
    },
  });

  await logActivity(user.id, "SUBSCRIPTION_PAUSED", {
    subscriptionId: subscription.id,
  });
}

async function handleSubscriptionResumed(subscription) {
  console.log("Processing customer.subscription.resumed:", subscription.id);

  const user = await getUserByStripeCustomerId(subscription.customer);
  if (!user) return;

  await prisma.school.update({
    where: { userId: user.id },
    data: {
      subscriptionStatus: "active",
    },
  });

  await logActivity(user.id, "SUBSCRIPTION_RESUMED", {
    subscriptionId: subscription.id,
  });
}

async function handleTrialWillEnd(subscription) {
  console.log("Processing customer.subscription.trial_will_end:", subscription.id);

  const user = await getUserByStripeCustomerId(subscription.customer);
  if (!user) return;

  await logActivity(user.id, "TRIAL_ENDING_SOON", {
    subscriptionId: subscription.id,
    trialEnd: new Date(subscription.trial_end * 1000),
  });

  // TODO: Send trial ending email reminder
}

async function handleInvoicePaymentSucceeded(invoice) {
  console.log("Processing invoice.payment_succeeded:", invoice.id);

  const user = await getUserByStripeCustomerId(invoice.customer);
  if (!user) return;

  // Record payment
  await prisma.payment.create({
    data: {
      userId: user.id,
      stripeInvoiceId: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: "succeeded",
      paymentDate: new Date(invoice.created * 1000),
    },
  });

  await logActivity(user.id, "PAYMENT_SUCCEEDED", {
    invoiceId: invoice.id,
    amount: invoice.amount_paid,
    currency: invoice.currency,
  });
}

async function handleInvoicePaymentFailed(invoice) {
  console.log("Processing invoice.payment_failed:", invoice.id);

  const user = await getUserByStripeCustomerId(invoice.customer);
  if (!user) return;

  // Record failed payment
  await prisma.payment.create({
    data: {
      userId: user.id,
      stripeInvoiceId: invoice.id,
      amount: invoice.amount_due,
      currency: invoice.currency,
      status: "failed",
      failureReason: invoice.last_payment_error?.message,
      paymentDate: new Date(invoice.created * 1000),
    },
  });

  // Update subscription status if needed
  if (invoice.subscription) {
    await prisma.school.update({
      where: { userId: user.id },
      data: {
        subscriptionStatus: "past_due",
      },
    });
  }

  await logActivity(user.id, "PAYMENT_FAILED", {
    invoiceId: invoice.id,
    amount: invoice.amount_due,
    error: invoice.last_payment_error?.message,
  });

  // TODO: Send payment failed email
}

async function handleInvoiceUpcoming(invoice) {
  try {
    // Validate invoice object
    if (!invoice) {
      console.error("handleInvoiceUpcoming: invoice object is missing");
      return;
    }

    // Handle case where invoice might be nested or have different structure
    const invoiceId = invoice.id;
    const customerId = invoice.customer;

    if (!invoiceId) {
      console.error("handleInvoiceUpcoming: invoice.id is missing", {
        invoiceKeys: invoice ? Object.keys(invoice) : "invoice is null/undefined",
        invoiceType: typeof invoice,
        objectType: invoice.object,
      });
      return;
    }

    if (!customerId) {
      console.error("handleInvoiceUpcoming: invoice.customer is missing", {
        invoiceId: invoiceId,
      });
      return;
    }

    console.log("Processing invoice.upcoming:", invoiceId);

    const user = await getUserByStripeCustomerId(customerId);
    if (!user) return;

    await logActivity(user.id, "INVOICE_UPCOMING", {
      invoiceId: invoiceId,
      amount: invoice.amount_due,
      dueDate: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
    });

    // TODO: Send upcoming invoice reminder email
  } catch (error) {
    console.error("Error handling invoice upcoming:", error);
  }
}

async function handlePaymentMethodAttached(paymentMethod) {
  console.log("Processing payment_method.attached:", paymentMethod.id);

  const user = await getUserByStripeCustomerId(paymentMethod.customer);
  if (!user) return;

  await logActivity(user.id, "PAYMENT_METHOD_ADDED", {
    paymentMethodId: paymentMethod.id,
    type: paymentMethod.type,
    last4: paymentMethod.card?.last4,
  });
}

async function handleCustomerUpdated(customer) {
  console.log("Processing customer.updated:", customer.id);

  const user = await getUserByStripeCustomerId(customer.id);
  if (!user) return;

  // Update email if changed
  if (customer.email && customer.email !== user.email) {
    await prisma.user.update({
      where: { id: user.id },
      data: { email: customer.email },
    });

    await logActivity(user.id, "EMAIL_UPDATED", {
      oldEmail: user.email,
      newEmail: customer.email,
    });
  }
}

async function handleCustomerDeleted(customer) {
  console.log("Processing customer.deleted:", customer.id);

  const user = await getUserByStripeCustomerId(customer.id);
  if (!user) return;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      deletedAt: new Date(),
      stripeCustomerId: null,
    },
  });

  await logActivity(user.id, "CUSTOMER_DELETED", {
    customerId: customer.id,
  });
}

async function handleDisputeCreated(dispute) {
  console.log("Processing charge.dispute.created:", dispute.id);

  const charge = await stripe.charges.retrieve(dispute.charge);
  const user = await getUserByStripeCustomerId(charge.customer);
  if (!user) return;

  await prisma.dispute.create({
    data: {
      userId: user.id,
      stripeDisputeId: dispute.id,
      amount: dispute.amount,
      currency: dispute.currency,
      reason: dispute.reason,
      status: dispute.status,
      createdAt: new Date(dispute.created * 1000),
    },
  });

  // Flag account
  await prisma.school.update({
    where: { userId: user.id },
    data: { flagged: true, flagReason: "Payment dispute created" },
  });

  await logActivity(user.id, "DISPUTE_CREATED", {
    disputeId: dispute.id,
    amount: dispute.amount,
    reason: dispute.reason,
  });

  // TODO: Notify admins about dispute
}

async function handleChargeRefunded(charge) {
  console.log("Processing charge.refunded:", charge.id);

  const user = await getUserByStripeCustomerId(charge.customer);
  if (!user) return;

  await prisma.refund.create({
    data: {
      userId: user.id,
      stripeChargeId: charge.id,
      amount: charge.amount_refunded,
      currency: charge.currency,
      reason: charge.refunds.data[0]?.reason,
      status: "completed",
      createdAt: new Date(),
    },
  });

  await logActivity(user.id, "CHARGE_REFUNDED", {
    chargeId: charge.id,
    amount: charge.amount_refunded,
    reason: charge.refunds.data[0]?.reason,
  });
}

// ========== HELPER FUNCTIONS ==========

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

async function updateUserSubscription(userId, session) {
  await prisma.school.update({
    where: { userId },
    data: {
      subscriptionId: session.subscription,
      subscriptionStatus: "active",
    },
  });
}

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

async function logWebhookEvent(event) {
  try {
    await prisma.webhookEvent.create({
      data: {
        stripeEventId: event.id,
        type: event.type,
        data: event.data,
        processed: true,
        createdAt: new Date(event.created * 1000),
      },
    });
  } catch (error) {
    // Ignore duplicate event errors
    if (error.code !== "P2002") {
      console.error("Error logging webhook event:", error);
    }
  }
}
