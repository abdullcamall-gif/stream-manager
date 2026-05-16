import { SYSTEM_CONTRACT_PATH } from "@/lib/contract";
import { prisma } from "@/lib/db";
import { Prisma, type OrderStatus } from "@prisma/client";

type ApproveOrderErrorCode =
  | "INVALID_INPUT"
  | "NOT_FOUND"
  | "ORDER_NOT_PENDING"
  | "NO_AVAILABLE_PROFILE";

export type ApproveOrderResult =
  | {
      ok: true;
      data: {
        orderId: string;
        status: OrderStatus;
        accountId: string;
        profileId: string;
        profileName: string;
        expiresAt: string;
      };
    }
  | {
      ok: false;
      error: {
        code: ApproveOrderErrorCode;
        message: string;
      };
      statusCode: number;
    };

class ApprovalError extends Error {
  code: ApproveOrderErrorCode;
  statusCode: number;
  constructor(code: ApproveOrderErrorCode, message: string, statusCode: number) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

function isSerializableConflict(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P2034";
}

const APPROVAL_TX_MAX_RETRIES = 3;

export async function approveOrder(orderIdInput: string): Promise<ApproveOrderResult> {
  void SYSTEM_CONTRACT_PATH;
  const orderId = orderIdInput.trim();
  if (!orderId) {
    return { ok: false, error: { code: "INVALID_INPUT", message: "orderId is required" }, statusCode: 400 };
  }

  for (let attempt = 1; attempt <= APPROVAL_TX_MAX_RETRIES; attempt += 1) {
    try {
      const approved = await prisma.$transaction(
        async (tx) => {
          const order = await tx.order.findUnique({
            where: { id: orderId },
            select: {
              id: true,
              status: true,
              assignment: {
                select: {
                  profileId: true,
                  expiresAt: true,
                  profile: { select: { profileName: true, accountId: true } },
                },
              },
              offer: { select: { serviceId: true, durationInDays: true } },
            },
          });

          if (!order) throw new ApprovalError("NOT_FOUND", "Order not found", 404);
          if (order.status === "APPROVED" && order.assignment) {
            return {
              orderId: order.id,
              status: "APPROVED" as const,
              accountId: order.assignment.profile.accountId,
              profileId: order.assignment.profileId,
              profileName: order.assignment.profile.profileName,
              expiresAt: order.assignment.expiresAt.toISOString(),
            };
          }
          if (order.status !== "PENDING") throw new ApprovalError("ORDER_NOT_PENDING", "Order is not pending and cannot be approved", 409);
          if (order.assignment) throw new ApprovalError("ORDER_NOT_PENDING", "Order already has an assignment", 409);

          const profile = await tx.streamingProfile.findFirst({
            where: {
              status: "AVAILABLE",
              account: { isActive: true, serviceId: order.offer.serviceId },
            },
            select: { id: true, profileName: true, accountId: true },
            orderBy: [{ createdAt: "asc" }],
          });

          if (!profile) throw new ApprovalError("NO_AVAILABLE_PROFILE", "No available profile for this offer", 409);

          const marked = await tx.streamingProfile.updateMany({
            where: { id: profile.id, status: "AVAILABLE" },
            data: {
              status: "OCCUPIED",
              isAvailable: false,
              expiresAt: new Date(Date.now() + order.offer.durationInDays * 24 * 60 * 60 * 1000),
              isExpired: false,
            },
          });
          if (marked.count !== 1) throw new ApprovalError("NO_AVAILABLE_PROFILE", "Profile is no longer available", 409);

          const expiresAt = new Date(Date.now() + order.offer.durationInDays * 24 * 60 * 60 * 1000);
          await tx.profileAssignment.create({
            data: { orderId: order.id, profileId: profile.id, expiresAt },
          });
          await tx.order.update({ where: { id: order.id }, data: { status: "APPROVED" } });

          return {
            orderId: order.id,
            status: "APPROVED" as const,
            accountId: profile.accountId,
            profileId: profile.id,
            profileName: profile.profileName,
            expiresAt: expiresAt.toISOString(),
          };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, maxWait: 5000, timeout: 10000 },
      );

      return { ok: true, data: approved };
    } catch (error) {
      if (error instanceof ApprovalError) {
        return { ok: false, error: { code: error.code, message: error.message }, statusCode: error.statusCode };
      }

      if (isSerializableConflict(error) && attempt < APPROVAL_TX_MAX_RETRIES) continue;
      console.error("approveOrder failed:", error);
      return { ok: false, error: { code: "INVALID_INPUT", message: "Approval failed due to an unexpected error" }, statusCode: 500 };
    }
  }

  return { ok: false, error: { code: "INVALID_INPUT", message: "Approval failed due to repeated transaction conflicts" }, statusCode: 500 };
}
