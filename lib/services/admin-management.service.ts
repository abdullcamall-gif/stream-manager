import { SYSTEM_CONTRACT_PATH } from "@/lib/contract";
import { prisma } from "@/lib/db";
import { approveOrder } from "@/lib/services/assignment.service";
import { AdminRole } from "@prisma/client";

type ServiceInput = { name: string; isActive?: boolean };
type PlanInput = {
  serviceId: string;
  name: string;
  price: number;
  durationInDays: number;
  maxSlots: number;
  isShared: boolean;
};
type AccountInput = {
  serviceId: string;
  email: string;
  password: string;
  totalSlots: number;
  availableSlots: number;
  isActive?: boolean;
};
type AdminInput = { email: string; passwordHash: string; role?: AdminRole };

export async function listAdminOrders() {
  void SYSTEM_CONTRACT_PATH;
  return prisma.order.findMany({
    select: {
      id: true,
      status: true,
      paymentMethod: true,
      proofImageUrl: true,
      createdAt: true,
      customer: { select: { id: true, name: true, phone: true } },
      plan: {
        select: {
          id: true,
          name: true,
          service: { select: { id: true, name: true } },
        },
      },
      assignment: {
        select: {
          id: true,
          slotNumber: true,
          expiresAt: true,
          account: { select: { id: true, email: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
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
  return approveOrder(orderIdInput);
}

export async function listServicesAdmin() {
  return prisma.service.findMany({ orderBy: { id: "desc" } });
}
export async function createServiceAdmin(input: ServiceInput) {
  const name = input.name.trim();
  return prisma.service.create({ data: { name, isActive: input.isActive ?? true } });
}
export async function updateServiceAdmin(id: string, input: Partial<ServiceInput>) {
  return prisma.service.update({ where: { id }, data: input });
}
export async function deleteServiceAdmin(id: string) {
  return prisma.service.delete({ where: { id } });
}

export async function listPlansAdmin() {
  return prisma.plan.findMany({ include: { service: true }, orderBy: { id: "desc" } });
}
export async function createPlanAdmin(input: PlanInput) {
  return prisma.plan.create({
    data: {
      serviceId: input.serviceId,
      name: input.name.trim(),
      price: input.price,
      durationInDays: input.durationInDays,
      maxSlots: input.maxSlots,
      isShared: input.isShared,
    },
  });
}
export async function updatePlanAdmin(id: string, input: Partial<PlanInput>) {
  return prisma.plan.update({ where: { id }, data: input });
}
export async function deletePlanAdmin(id: string) {
  return prisma.plan.delete({ where: { id } });
}

export async function listAccountsAdmin() {
  return prisma.account.findMany({ include: { service: true }, orderBy: { id: "desc" } });
}
export async function createAccountAdmin(input: AccountInput) {
  const availableSlots = Math.max(0, Math.min(input.availableSlots, input.totalSlots));
  return prisma.account.create({
    data: {
      serviceId: input.serviceId,
      email: input.email.trim().toLowerCase(),
      password: input.password,
      totalSlots: input.totalSlots,
      availableSlots,
      isActive: input.isActive ?? true,
    },
  });
}
export async function updateAccountAdmin(id: string, input: Partial<AccountInput>) {
  const patch: Partial<AccountInput> = { ...input };
  if (typeof patch.totalSlots === "number" || typeof patch.availableSlots === "number") {
    const current = await prisma.account.findUnique({ where: { id }, select: { totalSlots: true, availableSlots: true } });
    if (current) {
      const totalSlots = patch.totalSlots ?? current.totalSlots;
      const availableSlotsRaw = patch.availableSlots ?? current.availableSlots;
      patch.totalSlots = totalSlots;
      patch.availableSlots = Math.max(0, Math.min(availableSlotsRaw, totalSlots));
    }
  }

  return prisma.account.update({ where: { id }, data: patch });
}
export async function deleteAccountAdmin(id: string) {
  return prisma.account.delete({ where: { id } });
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
      select: { plan: { select: { price: true } } }
    }),
  ]);
  
  const totalRevenue = approvedOrders.reduce((sum, order) => sum + Number(order.plan.price), 0);

  return {
    totalRevenue,
    activeUsers: activeUsersCount.length,
    pendingOrders: pendingOrdersCount,
  };
}
