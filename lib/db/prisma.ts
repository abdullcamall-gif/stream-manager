import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  var prisma: PrismaClient | undefined;
}

/**
 * Shared Prisma client for server-side usage.
 * Business rules must follow docs/system.contract.md.
 */
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL for Prisma client initialization");
}

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
