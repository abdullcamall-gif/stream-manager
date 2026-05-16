const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const url = "postgresql://neondb_owner:npg_Olat1Dwdb6BI@ep-mute-forest-ap0nm7yc-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function main() {
  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const admin = await prisma.adminUser.findFirst({
      where: { email: "elber@gmail.com" }
    });
    console.log("Admin found:", admin ? admin.email : "Not found");
  } catch (error) {
    console.error("Prisma Error:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
