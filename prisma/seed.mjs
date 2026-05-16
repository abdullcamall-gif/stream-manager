import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://USER:PASSWORD@localhost:5432/stream_saas?schema=public",
});

const prisma = new PrismaClient({ adapter });

const services = [
  { name: "Netflix", slug: "netflix" },
  { name: "Spotify", slug: "spotify" },
  { name: "Prime Video", slug: "prime-video" },
  { name: "Apple Music", slug: "apple-music" },
  { name: "HBO Max", slug: "hbo-max" },
  { name: "Crunchyroll", slug: "crunchyroll" },
  { name: "IPTV", slug: "iptv" },
  { name: "Disney+", slug: "disney-plus" },
];
const adminEmail = "elber@gmail.com";
const adminPassword = "admin123";
const adminRole = "ADMIN";

async function main() {
  console.log("Seeding admin...");
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  
  // Upsert admin user
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { 
      passwordHash, 
      role: adminRole 
    },
    create: {
      email: adminEmail,
      passwordHash,
      role: adminRole,
    },
  });
  console.log(`Admin ${adminEmail} created/updated.`);

  console.log("Seeding services, offers, and accounts...");
  const durations = [15, 30, 60];
  const profileNames = ["Perfil 1", "Perfil 2", "Perfil 3", "Perfil 4", "Perfil 5"];

  for (const service of services) {
    const createdService = await prisma.streamingService.upsert({
      where: { name: service.name },
      update: {
        slug: service.slug,
        isActive: true,
      },
      create: { 
        name: service.name, 
        slug: service.slug,
        isActive: true 
      },
      include: { offers: true, accounts: true }
    });

    // Seed offers if missing
    if (createdService.offers.length === 0) {
      console.log(`Creating offers for ${service.name}...`);
      for (const days of durations) {
        await prisma.productOffer.create({
          data: {
            serviceId: createdService.id,
            name: `${service.name} ${days} DIAS`,
            price: days === 15 ? 300 : days === 30 ? 500 : 900,
            durationInDays: days,
          }
        });
      }
    }

    // Seed a dummy account if missing
    if (createdService.accounts.length === 0) {
      console.log(`Creating dummy account for ${service.name}...`);
      await prisma.streamingAccount.create({
        data: {
          serviceId: createdService.id,
          email: `${service.slug}-test@elber.mz`,
          password: await bcrypt.hash("test123", 10), // This should be encrypted if using encryptField, but seed uses raw bcrypt for now? Wait, the schema says password is a string.
          profiles: {
            create: profileNames.map(name => ({
              profileName: name,
              isAvailable: true
            }))
          }
        }
      });
    }
  }
  console.log("Seed completed successfully.");
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

