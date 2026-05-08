import { prisma } from "@/lib/db";
import { PaymentMethod } from "@prisma/client";

export type CreateOrderInput = {
  name: string;
  phone: string;
  planId: string;
  paymentMethod: PaymentMethod;
  proofImageUrl: string;
};

export type CreatedOrder = {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

export type CustomerOrderListItem = {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  service: string;
  plan: string;
  expiresAt: string | null;
  credentials: {
    email: string;
    password: string;
  } | null;
};

export async function isPlanAvailable(planId: string): Promise<boolean> {
  const plan = await prisma.plan.findFirst({
    where: {
      id: planId,
      price: { gt: 0 },
      durationInDays: { gt: 0 },
      service: {
        isActive: true,
      },
    },
    select: { id: true },
  });

  return Boolean(plan);
}

export async function findOrdersByPhone(
  phone: string,
): Promise<CustomerOrderListItem[]> {
  const orders = await prisma.order.findMany({
    where: {
      customer: {
        phone,
      },
    },
    select: {
      id: true,
      status: true,
      plan: {
        select: {
          name: true,
          service: {
            select: {
              name: true,
            },
          },
        },
      },
      assignment: {
        select: {
          expiresAt: true,
          account: {
            select: {
              email: true,
              password: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return orders.map((order) => {
    const assignment = order.assignment;
    const canExposeCredentials = order.status === "APPROVED" && assignment;

    return {
      id: order.id,
      status: order.status,
      service: order.plan.service.name,
      plan: order.plan.name,
      expiresAt: assignment?.expiresAt.toISOString() ?? null,
      credentials: canExposeCredentials
        ? {
            email: assignment.account.email,
            password: assignment.account.password,
          }
        : null,
    };
  });
}

export async function createOrderWithCustomer(
  input: CreateOrderInput,
): Promise<CreatedOrder> {
  const createdOrder = await prisma.$transaction(async (tx) => {
    const existingCustomer = await tx.customer.findFirst({
      where: { phone: input.phone },
      select: { id: true },
    });

    const customer = existingCustomer
      ? await tx.customer.update({
          where: { id: existingCustomer.id },
          data: { name: input.name },
          select: { id: true },
        })
      : await tx.customer.create({
          data: {
            name: input.name,
            phone: input.phone,
          },
          select: { id: true },
        });

    const order = await tx.order.create({
      data: {
        customerId: customer.id,
        planId: input.planId,
        paymentMethod: input.paymentMethod,
        proofImageUrl: input.proofImageUrl,
      },
      select: {
        id: true,
        status: true,
      },
    });

    return order;
  });

  return {
    id: createdOrder.id,
    status: createdOrder.status,
  };
}
