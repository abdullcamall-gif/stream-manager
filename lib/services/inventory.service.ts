import { prisma } from "@/lib/db";
import { ProfileStatus, AssignmentStatus } from "@prisma/client";

export async function getInventoryStats() {
  const now = new Date();

  // Sync expired assignments before getting stats
  await syncExpiredAssignments();

  const [
    totalProfiles,
    availableProfiles,
    occupiedProfiles,
    expiredProfiles,
    totalServices,
    lowStockServices,
  ] = await Promise.all([
    prisma.streamingProfile.count(),
    prisma.streamingProfile.count({ where: { status: ProfileStatus.AVAILABLE } }),
    prisma.streamingProfile.count({ where: { status: ProfileStatus.OCCUPIED } }),
    prisma.streamingProfile.count({ where: { isExpired: true } }),
    prisma.streamingService.count({ where: { isActive: true } }),
    getLowStockCount(3), // Threshold of 3
  ]);

  const serviceBreakdown = await prisma.streamingService.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: {
        select: {
          accounts: true,
        },
      },
      accounts: {
        select: {
          profiles: {
            select: {
              status: true,
              isExpired: true,
            },
          },
        },
      },
    },
  });

  const formattedBreakdown = serviceBreakdown.map((service) => {
    const allProfiles = service.accounts.flatMap((acc) => acc.profiles);
    return {
      id: service.id,
      name: service.name,
      slug: service.slug,
      accountCount: service._count.accounts,
      totalProfiles: allProfiles.length,
      available: allProfiles.filter((p) => p.status === ProfileStatus.AVAILABLE).length,
      occupied: allProfiles.filter((p) => p.status === ProfileStatus.OCCUPIED).length,
      expired: allProfiles.filter((p) => p.isExpired).length,
    };
  });

  return {
    summary: {
      totalProfiles,
      availableProfiles,
      occupiedProfiles,
      expiredProfiles,
      totalServices,
      lowStockServices,
    },
    serviceBreakdown: formattedBreakdown,
  };
}

async function getLowStockCount(threshold: number) {
  const services = await prisma.streamingService.findMany({
    where: { isActive: true },
    include: {
      accounts: {
        include: {
          profiles: {
            where: { status: ProfileStatus.AVAILABLE },
          },
        },
      },
    },
  });

  return services.filter((service) => {
    const availableCount = service.accounts.reduce(
      (sum, acc) => sum + acc.profiles.length,
      0
    );
    return availableCount <= threshold;
  }).length;
}

export async function getLowStockServices(threshold: number = 3) {
  const services = await prisma.streamingService.findMany({
    where: { isActive: true },
    include: {
      accounts: {
        include: {
          profiles: {
            where: { status: ProfileStatus.AVAILABLE },
          },
        },
      },
    },
  });

  return services
    .map((service) => {
      const availableCount = service.accounts.reduce(
        (sum, acc) => sum + acc.profiles.length,
        0
      );
      return {
        id: service.id,
        name: service.name,
        slug: service.slug,
        availableCount,
      };
    })
    .filter((s) => s.availableCount <= threshold);
}

export async function syncExpiredAssignments() {
  const now = new Date();

  // Find all active assignments that have expired
  const expiredAssignments = await prisma.profileAssignment.findMany({
    where: {
      status: AssignmentStatus.ACTIVE,
      expiresAt: { lt: now },
    },
    select: { id: true, profileId: true },
  });

  if (expiredAssignments.length === 0) return;

  const expiredIds = expiredAssignments.map((a) => a.id);
  const profileIds = Array.from(new Set(expiredAssignments.map((a) => a.profileId)));

  await prisma.$transaction([
    // Mark assignments as expired
    prisma.profileAssignment.updateMany({
      where: { id: { in: expiredIds } },
      data: {
        status: AssignmentStatus.EXPIRED,
        isExpired: true,
      },
    }),
    // Mark profiles as expired and potentially available again (depending on business logic)
    // Here we mark as expired and reset status to AVAILABLE if we want it to be immediately reusable,
    // or keep it as MAINTENANCE/EXPIRED for review.
    // The requirement says "Inventory deve refletir estado real dos profiles".
    // Usually, when it expires, the profile becomes available again unless it needs manual cleanup.
    prisma.streamingProfile.updateMany({
      where: { id: { in: profileIds } },
      data: {
        status: ProfileStatus.AVAILABLE, // Make it available again
        isExpired: true, // Keep track that it was once expired
      },
    }),
  ]);
}
