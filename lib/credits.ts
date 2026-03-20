import "server-only";
import { prisma } from "./prisma";
import { getOrCreateUser } from "./user";

export async function getUserCredits(clerkUserId: string): Promise<number> {
  const user = await getOrCreateUser(clerkUserId);
  return user.credits;
}

export async function deductCredit(clerkUserId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { clerkUserId } });
    if (!user || user.credits <= 0) {
      throw new Error("Insufficient credits");
    }

    await tx.user.update({
      where: { clerkUserId },
      data: { credits: { decrement: 1 } },
    });

    await tx.usageLog.create({
      data: {
        userId: user.id,
        creditsUsed: 1,
        imageCount: 1,
        description: "Image analysis",
      },
    });
  });
}

export async function addCredits(
  clerkUserId: string,
  credits: number,
  stripeSessionId: string,
  amountInCents: number
): Promise<void> {
  const user = await getOrCreateUser(clerkUserId);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { clerkUserId },
      data: { credits: { increment: credits } },
    });

    await tx.payment.create({
      data: {
        userId: user.id,
        stripeSessionId,
        amount: amountInCents,
        credits,
        status: "completed",
      },
    });
  });
}
