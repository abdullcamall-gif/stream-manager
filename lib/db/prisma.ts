import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  var prisma: PrismaClient | undefined;
}

/**
 * Shared Prisma client for server-side usage.
 * Business rules must follow docs/system.contract.md.
 */
const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://USER:PASSWORD@localhost:5432/stream_saas?schema=public";

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

export const prisma =
  globalThis.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
