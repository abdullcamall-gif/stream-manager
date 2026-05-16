import { prisma } from "@/lib/db/prisma";
import { FIXED_SERVICES } from "../constants/services";

export type CreateServiceData = {
  name: string;
  slug: string;
  logoUrl?: string;
  bannerUrl?: string;
  isActive?: boolean;
};

export type UpdateServiceData = Partial<CreateServiceData>;

export class AdminServicesService {
  static async getServices() {
    await this.ensureFixedServices();
    return await prisma.streamingService.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  static async ensureFixedServices() {
    for (const name of FIXED_SERVICES) {
      const slug = name.toLowerCase().replace(/\s+/g, "-");
      await prisma.streamingService.upsert({
        where: { name },
        update: {},
        create: {
          name,
          slug,
          isActive: true,
        },
      });
    }
  }

  static async createService(data: CreateServiceData) {
    return await prisma.streamingService.create({
      data: {
        name: data.name,
        slug: data.slug,
        logoUrl: data.logoUrl,
        bannerUrl: data.bannerUrl,
        isActive: data.isActive ?? true,
      },
    });
  }

  static async updateService(id: string, data: UpdateServiceData) {
    return await prisma.streamingService.update({
      where: { id },
      data,
    });
  }

  static async deleteService(id: string) {
    return await prisma.streamingService.delete({
      where: { id },
    });
  }
}
