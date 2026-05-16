import { prisma } from "./lib/db/prisma";

async function checkAdmin() {
  try {
    const admin = await prisma.adminUser.findFirst({
      where: { email: "elber@gmail.com" }
    });
    console.log("Admin found:", admin ? admin.email : "Not found");
  } catch (error) {
    console.error("Error fetching admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
