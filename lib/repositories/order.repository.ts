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
