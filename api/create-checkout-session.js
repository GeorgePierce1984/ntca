import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const {
    priceId,
    userType,
    formData,
    planName,
    billingType,
    metadata,
    successUrl,
    cancelUrl,
  } = req.body || {};

  if (!priceId) {
    return res.status(400).json({ error: "Missing priceId" });
  }

  console.log(
    "Creating checkout session for:",
    formData?.email,
    "plan:",
    planName,
  );

  try {
    // Use the origin header or fallback to the production domain
    const baseUrl =
      req.headers.origin ||
      "https://ntca-bvqxecsr4-rogit85s-projects.vercel.app";

    // Prepare metadata for webhook
    const sessionMetadata = {
      userType: userType || "school",
      planName: planName || "",
      billingType: billingType || "annual",
      formData: JSON.stringify(formData || {}), // Stringify the form data
      ...metadata, // Allow additional metadata
    };

    console.log("Session metadata:", sessionMetadata);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: sessionMetadata,
      success_url:
        successUrl ||
        `${baseUrl}/schools/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${baseUrl}/signup?from=payment`,
      customer_email: formData?.email, // Pre-fill customer email
    });

    console.log("Created checkout session:", session.id);
    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    console.error("Error details:", error.message);
    return res.status(500).json({
      error: "Internal Server Error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}
