import { prisma } from "@/lib/db";
import { RenewalStatus } from "@prisma/client";

const DAY_MS = 24 * 60 * 60 * 1000;

export async function releaseExpiredProfiles(now: Date = new Date()) {
  const expired = await prisma.profileAssignment.findMany({
    where: {
      expiresAt: { lte: now },
      renewalStatus: { not: RenewalStatus.EXPIRED },
    },
    select: { id: true, profileId: true },
  });

  let releasedProfiles = 0;
  for (const assignment of expired) {
    await prisma.$transaction(async (tx) => {
      await tx.profileAssignment.update({
        where: { id: assignment.id },
        data: { renewalStatus: RenewalStatus.EXPIRED },
      });

      const hasActive = await tx.profileAssignment.findFirst({
        where: {
          profileId: assignment.profileId,
          expiresAt: { gt: now },
          renewalStatus: { not: RenewalStatus.EXPIRED },
        },
        select: { id: true },
      });

      if (!hasActive) {
        const updated = await tx.streamingProfile.updateMany({
          where: { id: assignment.profileId, isAvailable: false },
          data: { isAvailable: true },
        });
        if (updated.count === 1) releasedProfiles += 1;
      }
    });
  }

  return { expiredAssignments: expired.length, releasedProfiles };
}

export async function notifyRenewals(daysBeforeExpiration = 3, now: Date = new Date()) {
  const expiring = await listExpiringAssignments(daysBeforeExpiration, now, false);

  if (expiring.length > 0) {
    await prisma.profileAssignment.updateMany({
      where: { id: { in: expiring.map((item) => item.assignmentId) } },
      data: { expirationNotificationSent: true, renewalStatus: RenewalStatus.PENDING },
    });
  }

  return expiring;
}

export async function listExpiringAssignments(daysBeforeExpiration = 3, now: Date = new Date(), includeNotified = true) {
  const windowEnd = new Date(now.getTime() + daysBeforeExpiration * DAY_MS);
  const expiring = await prisma.profileAssignment.findMany({
    where: {
      expiresAt: { gt: now, lte: windowEnd },
      ...(includeNotified ? {} : { expirationNotificationSent: false }),
      renewalStatus: { not: RenewalStatus.EXPIRED },
    },
    select: {
      id: true,
      expiresAt: true,
      orderId: true,
      order: {
        select: {
          customer: { select: { name: true, phone: true } },
          offer: { select: { name: true, service: { select: { name: true } } } },
        },
      },
    },
    orderBy: { expiresAt: "asc" },
  });

  return expiring.map((item) => ({
    assignmentId: item.id,
    orderId: item.orderId,
    expiresAt: item.expiresAt.toISOString(),
    customerName: item.order.customer.name,
    customerPhone: item.order.customer.phone,
    serviceName: item.order.offer.service.name,
    offerName: item.order.offer.name,
  }));
}

export async function renewAssignment(orderId: string, actor: "ADMIN" | "CUSTOMER" = "CUSTOMER") {
  const trimmed = orderId.trim();
  if (!trimmed) {
    return { ok: false as const, statusCode: 400, error: "orderId is required" };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: trimmed },
        select: {
          id: true,
          status: true,
          offer: { select: { durationInDays: true, serviceId: true } },
          assignment: {
            select: {
              id: true,
              expiresAt: true,
              profileId: true,
              profile: { select: { id: true, account: { select: { serviceId: true } } } },
            },
          },
        },
      });

      if (!order || !order.assignment) {
        throw new Error("Assignment not found for order");
      }
      if (order.status !== "APPROVED") {
        throw new Error("Only approved orders can be renewed");
      }

      const now = new Date();
      const baseDate = order.assignment.expiresAt > now ? order.assignment.expiresAt : now;
      const nextExpiration = new Date(baseDate.getTime() + order.offer.durationInDays * DAY_MS);

      const profileStillReusable = order.assignment.profile.account.serviceId === order.offer.serviceId;
      if (!profileStillReusable) {
        throw new Error("Profile cannot be reused for this renewal");
      }

      const updated = await tx.profileAssignment.update({
        where: { id: order.assignment.id },
        data: {
          expiresAt: nextExpiration,
          renewedAt: now,
          renewalStatus: RenewalStatus.RENEWED,
          expirationNotificationSent: false,
        },
        select: { id: true, expiresAt: true, profileId: true },
      });

      await tx.streamingProfile.update({
        where: { id: updated.profileId },
        data: { isAvailable: false },
      });

      return updated;
    }, { maxWait: 10_000, timeout: 15_000 });

    return {
      ok: true as const,
      data: {
        assignmentId: result.id,
        expiresAt: result.expiresAt.toISOString(),
        renewedBy: actor,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Renewal failed";
    return { ok: false as const, statusCode: 409, error: message };
  }
}
