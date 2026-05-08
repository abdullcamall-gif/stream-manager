import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://USER:PASSWORD@localhost:5432/stream_saas?schema=public",
});

const prisma = new PrismaClient({ adapter });

const services = ["Netflix", "Spotify", "Disney+"];

async function main() {
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
