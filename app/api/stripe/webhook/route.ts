import { NextResponse } from "next/server";
import { stripe, CREDIT_PACKAGES } from "@/lib/stripe";
import { addCredits } from "@/lib/credits";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Stripe webhook] Signature verification failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const clerkUserId = session.metadata?.clerkUserId;
    const packageId = session.metadata?.packageId;

    if (!clerkUserId || !packageId) {
      console.error("[Stripe webhook] Missing metadata on session:", session.id);
      return NextResponse.json({ received: true });
    }

    const pkg = CREDIT_PACKAGES.find((p) => p.id === packageId);
    if (!pkg) {
      console.error("[Stripe webhook] Unknown package:", packageId);
      return NextResponse.json({ received: true });
    }

    try {
      await addCredits(clerkUserId, pkg.credits, session.id, pkg.priceInCents);
      console.log(
        `[Stripe webhook] Added ${pkg.credits} credits for user ${clerkUserId}`
      );
    } catch (err) {
      console.error("[Stripe webhook] Failed to add credits:", err);
    }
  }

  return NextResponse.json({ received: true });
}
