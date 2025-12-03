import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { sessionId } = req.query;

  if (!sessionId) {
    return res.status(400).json({ 
      error: "Missing sessionId query parameter",
      usage: "Add ?sessionId=cs_test_xxxxx to the URL"
    });
  }

  try {
    console.log("🔍 Debugging Stripe session:", sessionId);

    // 1. Fetch session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'subscription']
    });

    console.log("✅ Session retrieved from Stripe");

    // 2. Check metadata
    const metadata = session.metadata || {};
    let formData = {};
    
    if (metadata.formData) {
      try {
        formData = JSON.parse(metadata.formData);
      } catch (e) {
        console.error("❌ Error parsing formData:", e);
      }
    }

    // 3. Check if user exists
    const email = formData.email || session.customer_email;
    let existingUser = null;
    let existingSchool = null;

    if (email) {
      existingUser = await prisma.user.findUnique({
        where: { email },
        include: { school: true }
      });

      if (existingUser?.school) {
        existingSchool = existingUser.school;
      }
    }

    // 4. Check database connection
    const dbTest = await prisma.$queryRaw`SELECT version();`;
    const dbVersion = dbTest[0]?.version || "Unknown";

    // 5. Check environment variables
    const envCheck = {
      hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      databaseUrlPreview: process.env.DATABASE_URL 
        ? `${process.env.DATABASE_URL.substring(0, 30)}...` 
        : "Not set"
    };

    // 6. Get recent webhook attempts from Stripe (if possible)
    let recentEvents = [];
    try {
      const events = await stripe.events.list({
        type: 'checkout.session.completed',
        limit: 5
      });
      recentEvents = events.data.map(e => ({
        id: e.id,
        created: new Date(e.created * 1000).toISOString(),
        sessionId: e.data.object.id,
        livemode: e.livemode
      }));
    } catch (e) {
      console.error("Could not fetch events:", e.message);
    }

    const debugInfo = {
      timestamp: new Date().toISOString(),
      session: {
        id: session.id,
        status: session.status,
        paymentStatus: session.payment_status,
        customerEmail: session.customer_email,
        customerId: session.customer,
        subscriptionId: session.subscription,
        mode: session.livemode ? "live" : "test",
        metadata: metadata,
        formDataParsed: formData,
        hasFormData: !!metadata.formData,
        hasUserType: !!metadata.userType
      },
      database: {
        connected: true,
        version: dbVersion,
        existingUser: existingUser ? {
          id: existingUser.id,
          email: existingUser.email,
          userType: existingUser.userType,
          hasSchool: !!existingUser.school
        } : null,
        existingSchool: existingSchool ? {
          id: existingSchool.id,
          name: existingSchool.name,
          userId: existingSchool.userId
        } : null
      },
      environment: envCheck,
      recentEvents: recentEvents,
      analysis: {
        shouldCreateUser: !existingUser && email && formData.email,
        hasRequiredMetadata: !!(metadata.formData && metadata.userType),
        metadataIssues: [
          !metadata.formData && "Missing formData in metadata",
          !metadata.userType && "Missing userType in metadata",
          !formData.email && "Missing email in formData",
          !formData.password && "Missing password in formData"
        ].filter(Boolean)
      }
    };

    res.status(200).json(debugInfo);

  } catch (error) {
    console.error("❌ Debug error:", error);
    res.status(500).json({
      error: "Debug failed",
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    await prisma.$disconnect();
  }
}

