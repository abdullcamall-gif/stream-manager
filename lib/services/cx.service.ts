import { prisma } from "@/lib/db";
import { AssignmentStatus, OrderStatus } from "@prisma/client";
import { sendWhatsAppMessage } from "./whatsapp.service";

export async function sendExpirationReminders() {
  const now = new Date();
  const warningThreshold = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours from now

  const expiringAssignments = await prisma.profileAssignment.findMany({
    where: {
      status: AssignmentStatus.ACTIVE,
      expiresAt: {
        gt: now,
        lt: warningThreshold,
      },
      expirationNotificationSent: false,
    },
    include: {
      order: {
        include: {
          customer: true,
          offer: { include: { service: true } },
        },
      },
    },
  });

  const sentCount = 0;
  for (const assignment of expiringAssignments) {
    const customer = assignment.order.customer;
    const serviceName = assignment.order.offer.service.name;
    const expiryDate = assignment.expiresAt.toLocaleDateString("pt-BR");

    const message = [
      `Olá ${customer.name}, seu acesso ao ${serviceName} expira em ${expiryDate}.`,
      "Para evitar interrupções, renove agora mesmo no nosso site!",
      "Acesse seu histórico para renovar com um clique.",
    ].join("\n");

    try {
      await sendWhatsAppMessage(customer.phone, message, {
        type: "EXPIRATION_REMINDER",
        assignmentId: assignment.id,
      });

      await prisma.profileAssignment.update({
        where: { id: assignment.id },
        data: { expirationNotificationSent: true },
      });
      
      await prisma.notification.create({
        data: {
          customerId: customer.id,
          type: "EXPIRATION_WARNING",
          content: message,
        }
      });

      // Update customer last reminder timestamp
      await prisma.customer.update({
        where: { id: customer.id },
        data: { lastReminderSent: new Date() },
      });

    } catch (error) {
      console.error(`Failed to send reminder to ${customer.phone}:`, error);
    }
  }

  return { sentCount: expiringAssignments.length };
}

export async function getCustomerTimeline(customerId: string) {
  const orders = await prisma.order.findMany({
    where: { customerId },
    include: {
      offer: { include: { service: true } },
      assignment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return orders.map((order) => {
    const events = [];
    
    events.push({
      date: order.createdAt,
      title: "Pedido Realizado",
      description: `Pedido de ${order.offer.service.name} (${order.offer.name}) iniciado via ${order.paymentMethod}.`,
      status: "COMPLETED",
    });

    if (order.status === OrderStatus.APPROVED) {
      events.push({
        date: order.assignment?.createdAt || order.createdAt,
        title: "Pagamento Aprovado",
        description: "Seu pagamento foi confirmado e o acesso foi liberado.",
        status: "COMPLETED",
      });
      
      if (order.assignment) {
        events.push({
          date: order.assignment.createdAt,
          title: "Acesso Entregue",
          description: "As credenciais foram disponibilizadas no seu histórico.",
          status: "COMPLETED",
        });
      }
    } else if (order.status === OrderStatus.REJECTED) {
      events.push({
        date: new Date(), // Mocking rejection date as now for simplicity if not tracked
        title: "Pedido Rejeitado",
        description: "Houve um problema com seu comprovante. Entre em contato com o suporte.",
        status: "FAILED",
      });
    } else {
      events.push({
        date: new Date(),
        title: "Aguardando Aprovação",
        description: "Estamos verificando seu comprovante de pagamento.",
        status: "PENDING",
      });
    }

    return {
      orderId: order.id,
      serviceName: order.offer.service.name,
      status: order.status,
      timeline: events,
    };
  });
}
