import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://USER:PASSWORD@localhost:5432/stream_saas?schema=public",
});

const prisma = new PrismaClient({ adapter });

const services = ["Netflix", "Spotify", "Disney+"];
const adminEmail = process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase() || "admin@streamsaas.local";
const adminPassword = process.env.ADMIN_SEED_PASSWORD || "admin123456";
const adminRole = process.env.ADMIN_SEED_ROLE === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN";

async function main() {
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const existingAdmin = await prisma.adminUser.findFirst({
    where: { email: adminEmail },
    select: { id: true },
  });

  if (existingAdmin) {
    await prisma.adminUser.update({
      where: { id: existingAdmin.id },
      data: { passwordHash, role: adminRole },
    });
  } else {
    await prisma.adminUser.create({
      data: {
        email: adminEmail,
        passwordHash,
        role: adminRole,
      },
    });
  }

  for (const name of services) {
    const existingService = await prisma.service.findFirst({
      where: { name },
      select: { id: true },
    });

    if (existingService) {
      await prisma.service.update({
        where: { id: existingService.id },
        data: { isActive: true },
      });
      continue;
    }

    await prisma.service.create({
      data: { name, isActive: true },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seed failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
