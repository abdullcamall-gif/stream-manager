import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

type RequestContext = {
  ipAddress?: string;
  userAgent?: string;
};

export async function logAudit(input: {
  adminUserId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  request?: RequestContext;
}) {
  await prisma.auditLog.create({
    data: {
      adminUserId: input.adminUserId,
      action: input.action,
      resource: input.resource,
      resourceId: input.resourceId,
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
      ipAddress: input.request?.ipAddress,
      userAgent: input.request?.userAgent,
    },
  });
}

export async function logSecurityEvent(input: {
  eventType: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  message: string;
  metadata?: Record<string, unknown>;
  request?: RequestContext;
}) {
  await prisma.securityEvent.create({
    data: {
      eventType: input.eventType,
      severity: input.severity,
      message: input.message,
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
      ipAddress: input.request?.ipAddress,
      userAgent: input.request?.userAgent,
    },
  });
}

export async function logAccess(input: {
  customerId?: string;
  path: string;
  method: string;
  request?: RequestContext;
}) {
  await prisma.accessLog.create({
    data: {
      customerId: input.customerId,
      path: input.path,
      method: input.method,
      ipAddress: input.request?.ipAddress,
      userAgent: input.request?.userAgent,
    },
  });
}
