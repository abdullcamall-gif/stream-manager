import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.mjs",
  },
  datasource: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://USER:PASSWORD@localhost:5432/stream_saas?schema=public",
  },
});
