import { PrismaClient } from "@prisma/client";

/**
 * True only when a real database URL is configured. The project ships with a
 * placeholder DATABASE_URL so it runs with zero setup (seed-data fallback); this
 * guard lets server queries skip the database entirely until Neon is wired up.
 */
export function hasDatabase(): boolean {
  const url = process.env.DATABASE_URL ?? "";
  if (url.length === 0) return false;
  // Reject the shipped placeholder values.
  return !/USER:PASSWORD|HOST(-pooler)?\.REGION/.test(url);
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
