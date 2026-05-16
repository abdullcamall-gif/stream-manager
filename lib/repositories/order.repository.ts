import { prisma } from "@/lib/db";
import { maybeDecryptField } from "@/lib/security/crypto";
import { PaymentMethod } from "@prisma/client";

export type CreateOrderInput = {
  name: string;
  phone: string;
  offerId: string;
  paymentMethod: PaymentMethod;
  proofImageUrl: string;
};

export type CreatedOrder = {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

export type TimelineEvent = {
  date: Date;
  title: string;
  description: string;
  status: "COMPLETED" | "PENDING" | "FAILED";
};

export type CustomerOrderListItem = {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  service: string;
  plan: string;
  expiresAt: string | null;
  expiresSoon: boolean;
  renewalStatus: string | null;
  canRenew: boolean;
  credentials: { email: string; password: string } | null;
  timeline: TimelineEvent[];
};

export async function isPlanAvailable(planId: string): Promise<boolean> {
  const plan = await prisma.productOffer.findFirst({
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
      offer: {
        select: {
          name: true,
          service: {
            select: {
              name: true,
            },
          },
        },
      },
      createdAt: true,
      assignment: {
        select: {
          createdAt: true,
          expiresAt: true,
          renewalStatus: true,
          profile: {
            select: {
              account: {
                select: {
                  email: true,
                  password: true,
                },
              },
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
    const expiresAtIso = assignment?.expiresAt.toISOString() ?? null;
    const now = Date.now();
    const expiresSoon = assignment ? assignment.expiresAt.getTime() - now <= 3 * 24 * 60 * 60 * 1000 : false;

    const timeline: TimelineEvent[] = [
      {
        date: order.createdAt as any, // assuming createdAt is selected
        title: "Pedido Realizado",
        description: "Seu pedido foi recebido e aguarda aprovação do pagamento.",
        status: "COMPLETED",
      },
    ];

    if (order.status === "APPROVED") {
      timeline.push({
        date: assignment?.createdAt || new Date(),
        title: "Pagamento Aprovado",
        description: "Seu pagamento foi confirmado.",
        status: "COMPLETED",
      });
      timeline.push({
        date: assignment?.createdAt || new Date(),
        title: "Acesso Entregue",
        description: "Suas credenciais estão disponíveis abaixo.",
        status: "COMPLETED",
      });
    } else if (order.status === "REJECTED") {
      timeline.push({
        date: new Date(),
        title: "Pedido Rejeitado",
        description: "Houve um problema com seu comprovante.",
        status: "FAILED",
      });
    } else {
      timeline.push({
        date: new Date(),
        title: "Verificando Pagamento",
        description: "Nossa equipe está analisando seu comprovante.",
        status: "PENDING",
      });
    }

    return {
      id: order.id,
      status: order.status,
      service: order.offer.service.name,
      plan: order.offer.name,
      expiresAt: expiresAtIso,
      expiresSoon,
      renewalStatus: assignment?.renewalStatus ?? null,
      canRenew: order.status === "APPROVED" && Boolean(assignment),
      credentials:
        order.status === "APPROVED" && assignment
          ? {
              email: assignment.profile.account.email,
              password: maybeDecryptField(assignment.profile.account.password),
            }
          : null,
      timeline,
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
        offerId: input.offerId,
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
