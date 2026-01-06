import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { customerId, returnUrl } = req.body;

  if (!customerId) {
    return res.status(400).json({ error: "Missing customerId" });
  }

  try {
    // Use the origin header or fallback to the production domain
    const baseUrl =
      req.headers.origin ||
      "https://ntca-bvqxecsr4-rogit85s-projects.vercel.app";

    // Create a Stripe Customer Portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${baseUrl}/schools/dashboard`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe portal error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

