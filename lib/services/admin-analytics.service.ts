import { prisma } from "@/lib/db";
import { RenewalStatus } from "@prisma/client";

type MonthBucket = { key: string; label: string };

function toMonthKey(date: Date, timeZone: string): MonthBucket {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value ?? "0000";
  const month = parts.find((p) => p.type === "month")?.value ?? "00";
  const key = `${year}-${month}`;
  const label = new Intl.DateTimeFormat("pt-BR", {
    timeZone,
    month: "short",
    year: "2-digit",
  }).format(date);
  return { key, label };
}

export async function getRevenueAnalytics() {
  const approvedOrders = await prisma.order.findMany({
    where: { status: "APPROVED" },
    select: { offer: { select: { price: true } } },
  });
  const totalRevenue = approvedOrders.reduce((sum, row) => sum + Number(row.offer.price), 0);
  const avgTicket = approvedOrders.length > 0 ? totalRevenue / approvedOrders.length : 0;

  return {
    totalRevenue,
    approvedOrders: approvedOrders.length,
    avgTicket,
  };
}

export async function getRenewalAnalytics() {
  const [totalAssignments, renewed, pending, expired] = await Promise.all([
    prisma.profileAssignment.count(),
    prisma.profileAssignment.count({ where: { renewalStatus: RenewalStatus.RENEWED } }),
    prisma.profileAssignment.count({ where: { renewalStatus: RenewalStatus.PENDING } }),
    prisma.profileAssignment.count({ where: { renewalStatus: RenewalStatus.EXPIRED } }),
  ]);

  const renewalRate = totalAssignments > 0 ? renewed / totalAssignments : 0;
  const churnRate = totalAssignments > 0 ? expired / totalAssignments : 0;

  return {
    totalAssignments,
    renewed,
    pending,
    expired,
    renewalRate,
    churnRate,
  };
}

export async function getTopServicesAnalytics(limit = 5) {
  const approvedOrders = await prisma.order.findMany({
    where: { status: "APPROVED" },
    select: {
      offer: {
        select: {
          service: { select: { id: true, name: true } },
          price: true,
        },
      },
    },
  });

  const byService = new Map<string, { serviceId: string; serviceName: string; orders: number; revenue: number }>();
  for (const row of approvedOrders) {
    const id = row.offer.service.id;
    const current = byService.get(id) ?? {
      serviceId: id,
      serviceName: row.offer.service.name,
      orders: 0,
      revenue: 0,
    };
    current.orders += 1;
    current.revenue += Number(row.offer.price);
    byService.set(id, current);
  }

  return Array.from(byService.values())
    .sort((a, b) => b.revenue - a.revenue || b.orders - a.orders)
    .slice(0, limit);
}

export async function getMonthlyMetricsAnalytics(months = 6, timeZone = "Africa/Maputo") {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1), 1, 0, 0, 0));

  const [approvedOrders, renewedAssignments, expiredAssignments] = await Promise.all([
    prisma.order.findMany({
      where: { status: "APPROVED", createdAt: { gte: start } },
      select: { createdAt: true, offer: { select: { price: true } } },
    }),
    prisma.profileAssignment.findMany({
      where: { renewedAt: { gte: start }, renewalStatus: RenewalStatus.RENEWED },
      select: { renewedAt: true },
    }),
    prisma.profileAssignment.findMany({
      where: { expiresAt: { gte: start }, renewalStatus: RenewalStatus.EXPIRED },
      select: { expiresAt: true },
    }),
  ]);

  const buckets = new Map<string, { key: string; month: string; revenue: number; orders: number; renewals: number; churned: number }>();
  for (let i = 0; i < months; i += 1) {
    const seed = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const { key, label } = toMonthKey(seed, timeZone);
    buckets.set(key, { key, month: label, revenue: 0, orders: 0, renewals: 0, churned: 0 });
  }

  for (const row of approvedOrders) {
    const { key } = toMonthKey(row.createdAt, timeZone);
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket.orders += 1;
    bucket.revenue += Number(row.offer.price);
  }
  for (const row of renewedAssignments) {
    if (!row.renewedAt) continue;
    const { key } = toMonthKey(row.renewedAt, timeZone);
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket.renewals += 1;
  }
  for (const row of expiredAssignments) {
    const { key } = toMonthKey(row.expiresAt, timeZone);
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket.churned += 1;
  }

  return Array.from(buckets.values())
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(({ key: _key, ...rest }) => rest);
}

export async function getOperationalMetrics() {
  const [activeProfiles, occupiedProfiles, pendingOrders] = await Promise.all([
    prisma.streamingProfile.count({ where: { isAvailable: true, isExpired: false } }),
    prisma.streamingProfile.count({ where: { isAvailable: false, isExpired: false } }),
    prisma.order.count({ where: { status: "PENDING" } }),
  ]);

  const totalProfiles = activeProfiles + occupiedProfiles;
  const occupancyRate = totalProfiles > 0 ? occupiedProfiles / totalProfiles : 0;

  return {
    totalProfiles,
    activeProfiles,
    occupiedProfiles,
    pendingOrders,
    occupancyRate,
  };
}
