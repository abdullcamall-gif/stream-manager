import { prisma } from "@/lib/db";

export type PlanListItem = {
  id: string;
  serviceId: string;
  serviceName: string;
  name: string;
  price: number;
  durationInDays: number;
  maxSlots: number;
  isShared: boolean;
};

export async function findActivePlans(): Promise<PlanListItem[]> {
  const plans = await prisma.plan.findMany({
    where: {
      price: { gt: 0 },
      durationInDays: { gt: 0 },
      service: {
        isActive: true,
      },
    },
    select: {
      id: true,
      serviceId: true,
      name: true,
      price: true,
      durationInDays: true,
      maxSlots: true,
      isShared: true,
      service: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [{ service: { name: "asc" } }, { price: "asc" }],
  });

  return plans.map((plan) => ({
    id: plan.id,
    serviceId: plan.serviceId,
    serviceName: plan.service.name,
    name: plan.name,
    price: Number(plan.price),
    durationInDays: plan.durationInDays,
    maxSlots: plan.maxSlots,
    isShared: plan.isShared,
  }));
}
