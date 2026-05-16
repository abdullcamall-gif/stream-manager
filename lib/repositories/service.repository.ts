import { prisma } from "@/lib/db";

export type ServiceListItem = {
  id: string;
  name: string;
};

export async function findActiveServices(): Promise<ServiceListItem[]> {
  return prisma.streamingService.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}
