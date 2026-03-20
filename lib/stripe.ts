import "server-only";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

export const CREDIT_PACKAGES = [
  {
    id: "credits_50",
    credits: 50,
    priceInCents: 500,
    label: "50 credits",
    description: "Good for trying it out",
    popular: false,
  },
  {
    id: "credits_200",
    credits: 200,
    priceInCents: 1500,
    label: "200 credits",
    description: "Best value for regular use",
    popular: true,
  },
  {
    id: "credits_500",
    credits: 500,
    priceInCents: 3000,
    label: "500 credits",
    description: "For heavy usage and teams",
    popular: false,
  },
] as const;

export type CreditPackage = (typeof CREDIT_PACKAGES)[number];
