import { SYSTEM_CONTRACT_PATH } from "@/lib/contract";
import { prisma } from "@/lib/db";
import { approveOrder } from "@/lib/services/assignment.service";
import { encryptField, maybeDecryptField } from "@/lib/security/crypto";
import { generateWhatsAppDeliveryMessage } from "@/lib/services/whatsapp-generator";
import { sendWhatsAppMessage } from "@/lib/services/whatsapp.service";
import { AdminRole } from "@prisma/client";

type ServiceInput = {
  name: string;
  slug: string;
  logoUrl?: string;
  bannerUrl?: string;
  isActive?: boolean;
};
type OfferInput = {
  serviceId: string;
  name: string;
  price: number;
  durationInDays: number;
};
type AccountInput = {
  serviceId: string;
  email: string;
  password: string;
  profileNames: string[];
  isActive?: boolean;
};
type AdminInput = { email: string; passwordHash: string; role?: AdminRole };

export async function listAdminOrders() {
  void SYSTEM_CONTRACT_PATH;
  const rows = await prisma.order.findMany({
    select: {
      id: true,
      status: true,
      paymentMethod: true,
      proofImageUrl: true,
      createdAt: true,
      customer: { select: { id: true, name: true, phone: true } },
      offer: {
        select: {
          id: true,
          name: true,
          price: true,
          service: { select: { id: true, name: true } },
        },
      },
      assignment: {
        select: {
          id: true,
          expiresAt: true,
          profile: {
            select: {
              id: true,
              profileName: true,
              account: { select: { id: true, email: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((row) => ({
    ...row,
    plan: {
      id: row.offer.id,
      name: row.offer.name,
      price: row.offer.price,
      service: row.offer.service,
    },
    assignment: row.assignment
      ? {
          id: row.assignment.id,
          slotNumber: row.assignment.profile.profileName,
          expiresAt: row.assignment.expiresAt,
          account: row.assignment.profile.account,
        }
      : null,
  }));
}

export async function rejectOrder(orderIdInput: string) {
  void SYSTEM_CONTRACT_PATH;
  const orderId = orderIdInput.trim();
  if (!orderId) {
    return { ok: false as const, statusCode: 400, error: { code: "INVALID_INPUT", message: "orderId is required" } };
  }

  const updated = await prisma.order.updateMany({
    where: { id: orderId, status: "PENDING" },
    data: { status: "REJECTED" },
  });
  if (updated.count !== 1) {
    return { ok: false as const, statusCode: 409, error: { code: "INVALID_INPUT", message: "order is not pending" } };
  }

  return { ok: true as const, data: { id: orderId, status: "REJECTED" as const } };
}

export async function approveOrderForAdmin(orderIdInput: string) {
  const result = await approveOrder(orderIdInput);
  if (!result.ok) return result;

  const order = await prisma.order.findUnique({
    where: { id: result.data.orderId },
    select: {
      offer: { select: { service: { select: { name: true } } } },
      assignment: {
        select: {
          expiresAt: true,
          profile: {
            select: {
              profileName: true,
              account: { select: { email: true, password: true } },
            },
          },
        },
      },
    },
  });

  if (!order?.assignment) return result;
  const message = generateWhatsAppDeliveryMessage({
    serviceName: order.offer.service.name,
    accountEmail: order.assignment.profile.account.email,
    accountPassword: maybeDecryptField(order.assignment.profile.account.password),
    profileName: order.assignment.profile.profileName,
    expiresAt: order.assignment.expiresAt,
  });

  // Automate WhatsApp delivery
  const customerPhone = (await prisma.order.findUnique({
    where: { id: result.data.orderId },
    select: { customer: { select: { phone: true } } }
  }))?.customer.phone;

  if (customerPhone) {
    const delivery = await sendWhatsAppMessage(customerPhone, message, { orderId: result.data.orderId });
    const deliveryError =
      delivery.status === "FAILED"
        ? delivery.error ?? "Falha ao enviar mensagem no WhatsApp."
        : null;

    return {
      ok: true as const,
      data: {
        ...result.data,
        whatsappMessage: message,
        whatsappDelivery: {
          status: delivery.status,
          error: deliveryError,
        },
      },
    };
  }

  return {
    ok: true as const,
    data: {
      ...result.data,
      whatsappMessage: message,
      whatsappDelivery: {
        status: "FAILED" as const,
        error: "Cliente sem telefone cadastrado para envio via WhatsApp.",
      },
    },
  };
}

export async function listServicesAdmin() {
  return prisma.streamingService.findMany({ orderBy: { id: "desc" } });
}
export async function createServiceAdmin(input: ServiceInput) {
  const name = input.name.trim();
  const slug = input.slug.trim().toLowerCase().replace(/\s+/g, "-");
  return prisma.streamingService.create({
    data: {
      name,
      slug,
      logoUrl: input.logoUrl,
      bannerUrl: input.bannerUrl,
      isActive: input.isActive ?? true,
    },
  });
}

export async function createServiceWithOffers(input: ServiceInput & { durations: number[]; price: number; accountEmail: string; accountPassword: string; profileNames: string[] }) {
  const name = input.name.trim();
  const slug = input.slug.trim().toLowerCase().replace(/\s+/g, "-");
  const durations = Array.from(new Set(input.durations.filter((d) => Number.isFinite(d) && d > 0)));
  const profiles = input.profileNames.map((p) => p.trim()).filter(Boolean);

  return prisma.streamingService.create({
    data: {
      name,
      slug,
      logoUrl: input.logoUrl,
      bannerUrl: input.bannerUrl,
      isActive: input.isActive ?? true,
      offers: {
        create: durations.map((durationInDays) => ({
          name: `${name} ${durationInDays} dias`,
          price: input.price,
          durationInDays,
        })),
      },
      accounts: {
        create: {
          email: input.accountEmail.trim().toLowerCase(),
          password: encryptField(input.accountPassword),
          isActive: true,
          profiles: {
            create: profiles.map((profileName) => ({ profileName, isAvailable: true })),
          },
        },
      },
    },
    include: {
      offers: true,
      accounts: { include: { profiles: true } },
    },
  });
}

export async function updateServiceAdmin(id: string, input: Partial<ServiceInput>) {
  return prisma.streamingService.update({ where: { id }, data: input });
}
export async function deleteServiceAdmin(id: string) {
  return prisma.streamingService.delete({ where: { id } });
}

export async function listPlansAdmin() {
  return prisma.productOffer.findMany({ include: { service: true }, orderBy: { id: "desc" } });
}
export async function createPlanAdmin(input: OfferInput) {
  return prisma.productOffer.create({
    data: {
      serviceId: input.serviceId,
      name: input.name.trim(),
      price: input.price,
      durationInDays: input.durationInDays,
    },
  });
}
export async function updatePlanAdmin(id: string, input: Partial<OfferInput>) {
  return prisma.productOffer.update({ where: { id }, data: input });
}
export async function deletePlanAdmin(id: string) {
  return prisma.productOffer.delete({ where: { id } });
}

export async function listAccountsAdmin() {
  return prisma.streamingAccount.findMany({
    include: { service: true, profiles: true },
    orderBy: { id: "desc" },
  });
}
export async function createAccountAdmin(input: AccountInput) {
  return prisma.streamingAccount.create({
    data: {
      serviceId: input.serviceId,
      email: input.email.trim().toLowerCase(),
      password: encryptField(input.password),
      isActive: input.isActive ?? true,
      profiles: {
        create: input.profileNames.map((profileName) => ({
          profileName: profileName.trim(),
          isAvailable: true,
        })),
      },
    },
    include: { profiles: true },
  });
}
export async function updateAccountAdmin(id: string, input: Partial<AccountInput>) {
  const patch: { serviceId?: string; email?: string; password?: string; isActive?: boolean } = {};
  if (typeof input.serviceId === "string") patch.serviceId = input.serviceId;
  if (typeof input.email === "string") patch.email = input.email.trim().toLowerCase();
  if (typeof input.password === "string") patch.password = encryptField(input.password);
  if (typeof input.isActive === "boolean") patch.isActive = input.isActive;
  return prisma.streamingAccount.update({ where: { id }, data: patch, include: { profiles: true } });
}
export async function deleteAccountAdmin(id: string) {
  return prisma.streamingAccount.delete({ where: { id } });
}

export async function listAdminsAdmin() {
  return prisma.adminUser.findMany({ orderBy: { id: "desc" } });
}
export async function createAdminAdmin(input: AdminInput) {
  return prisma.adminUser.create({
    data: {
      email: input.email.trim().toLowerCase(),
      passwordHash: input.passwordHash,
      role: input.role ?? "ADMIN",
    },
  });
}
export async function updateAdminAdmin(id: string, input: Partial<AdminInput>) {
  return prisma.adminUser.update({ where: { id }, data: input });
}
export async function deleteAdminAdmin(id: string) {
  return prisma.adminUser.delete({ where: { id } });
}

export async function getAdminStats() {
  const [activeUsersCount, pendingOrdersCount, approvedOrders] = await Promise.all([
    prisma.order.groupBy({
      by: ["customerId"],
      where: { status: "APPROVED" },
    }),
    prisma.order.count({
      where: { status: "PENDING" },
    }),
    prisma.order.findMany({
      where: { status: "APPROVED" },
      select: { offer: { select: { price: true } } },
    }),
  ]);

  const totalRevenue = approvedOrders.reduce((sum, order) => sum + Number(order.offer.price), 0);

  return {
    totalRevenue,
    activeUsers: activeUsersCount.length,
    pendingOrders: pendingOrdersCount,
  };
}
