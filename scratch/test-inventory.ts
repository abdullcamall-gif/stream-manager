import { getInventoryStats, syncExpiredAssignments } from "../lib/services/inventory.service";
import { prisma } from "../lib/db";
import { ProfileStatus } from "@prisma/client";

async function testInventory() {
  console.log("--- Testing Inventory Service ---");

  // 1. Get initial stats
  const initialStats = await getInventoryStats();
  console.log("Initial Stats:", JSON.stringify(initialStats.summary, null, 2));

  // 2. Mock an expired profile
  const firstProfile = await prisma.streamingProfile.findFirst();
  if (firstProfile) {
    console.log(`Mocking expiration for profile: ${firstProfile.id}`);
    
    // Create an expired assignment
    await prisma.profileAssignment.create({
      data: {
        orderId: `test-order-${Date.now()}`,
        profileId: firstProfile.id,
        expiresAt: new Date(Date.now() - 10000), // Expired 10 seconds ago
        status: "ACTIVE",
      }
    });

    // Update profile to OCCUPIED
    await prisma.streamingProfile.update({
      where: { id: firstProfile.id },
      data: { status: "OCCUPIED" }
    });

    console.log("Running sync...");
    await syncExpiredAssignments();

    const afterSyncStats = await getInventoryStats();
    console.log("Stats after sync:", JSON.stringify(afterSyncStats.summary, null, 2));
    
    const updatedProfile = await prisma.streamingProfile.findUnique({
      where: { id: firstProfile.id }
    });
    console.log("Profile status after sync:", updatedProfile?.status);
  } else {
    console.log("No profiles found to test.");
  }
}

testInventory()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
