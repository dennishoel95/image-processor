import "server-only";
import { prisma } from "./prisma";

export async function getOrCreateUser(clerkUserId: string) {
  return prisma.user.upsert({
    where: { clerkUserId },
    update: {},
    create: { clerkUserId, credits: 0 },
  });
}
