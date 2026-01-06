import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ 
      error: "Missing sessionId",
      usage: "POST with { sessionId: 'cs_test_xxxxx' }"
    });
  }

  try {
    console.log("🔍 Testing webhook logic for session:", sessionId);

    // Fetch session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'subscription']
    });

    console.log("✅ Session retrieved:", session.id);
    console.log("📋 Metadata:", session.metadata);

    const metadata = session.metadata || {};
    if (!metadata.formData) {
      return res.status(400).json({
        error: "Missing formData in metadata",
        metadata: metadata
      });
    }

    // Parse form data
    let formData;
    try {
      formData = JSON.parse(metadata.formData);
    } catch (error) {
      return res.status(400).json({
        error: "Error parsing formData",
        details: error.message
      });
    }

    const email = formData.email || session.customer_email;
    const userType = metadata.userType || "school";

    if (!email) {
      return res.status(400).json({
        error: "Missing email",
        formData: formData
      });
    }

    console.log("📧 Processing registration for:", email);

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      console.log("⚠️  User already exists:", email);
      return res.status(200).json({
        message: "User already exists",
        userId: user.id,
        email: user.email,
        hasSchool: !!(await prisma.school.findUnique({ where: { userId: user.id } }))
      });
    }

    // Hash password
    const bcrypt = await import("bcryptjs");
    const hashedPassword = formData.password
      ? await bcrypt.hash(formData.password, 12)
      : null;

    console.log("🔄 Creating user and school in transaction...");

    // Create user and profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          userType: userType.toUpperCase(),
          stripeCustomerId: session.customer,
        },
      });

      console.log("✅ User created:", newUser.id);

      // Create school profile
      const profile = await tx.school.create({
        data: {
          userId: newUser.id,
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

      console.log("✅ School created:", profile.id);

      return { user: newUser, profile };
    });

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

    console.log("✅ Successfully created user and school!");

    res.status(200).json({
      success: true,
      message: "User and school created successfully",
      userId: result.user.id,
      schoolId: result.profile.id,
      email: result.user.email,
      schoolName: result.profile.name
    });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      error: "Failed to process",
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    await prisma.$disconnect();
  }
}

