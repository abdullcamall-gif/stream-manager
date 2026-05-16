import { prisma } from "@/lib/db";
import { MessageStatus } from "@prisma/client";
import { getWhatsAppProvider } from "./whatsapp-provider";

const MAX_RETRIES = 3;

export async function sendWhatsAppMessage(to: string, content: string, metadata?: any) {
  // 1. Create Log
  const log = await prisma.whatsappMessageLog.create({
    data: {
      to,
      content,
      status: MessageStatus.PENDING,
      metadata: metadata || {},
    },
  });

  // 2. Attempt Delivery
  return executeDelivery(log.id, to, content);
}

async function executeDelivery(logId: string, to: string, content: string) {
  const provider = getWhatsAppProvider();
  
  await prisma.whatsappMessageLog.update({
    where: { id: logId },
    data: { lastAttemptAt: new Date() },
  });

  const result = await provider.sendMessage(to, content);

  if (result.success) {
    return prisma.whatsappMessageLog.update({
      where: { id: logId },
      data: {
        status: MessageStatus.SENT,
        deliveryStatus: "sent",
        error: null,
      },
    });
  } else {
    return prisma.whatsappMessageLog.update({
      where: { id: logId },
      data: {
        status: MessageStatus.FAILED,
        error: result.error,
        retryCount: { increment: 1 },
      },
    });
  }
}

export async function retryFailedMessages() {
  const failedMessages = await prisma.whatsappMessageLog.findMany({
    where: {
      status: MessageStatus.FAILED,
      retryCount: { lt: MAX_RETRIES },
    },
  });

  for (const msg of failedMessages) {
    await executeDelivery(msg.id, msg.to, msg.content);
  }

  return { attempted: failedMessages.length };
}

export async function getWhatsAppLogs() {
  return prisma.whatsappMessageLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
