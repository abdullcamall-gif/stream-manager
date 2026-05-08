import { SYSTEM_CONTRACT_PATH } from "@/lib/contract";
import { prisma } from "@/lib/db";
import { Prisma, type OrderStatus } from "@prisma/client";

type ApproveOrderErrorCode =
  | "INVALID_INPUT"
  | "NOT_FOUND"
  | "ORDER_NOT_PENDING"
  | "NO_AVAILABLE_ACCOUNT";

export type ApproveOrderResult =
  | {
      ok: true;
      data: {
        orderId: string;
        status: OrderStatus;
        accountId: string;
        slotNumber: number;
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
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2034"
  );
}

function computeAvailableSlot(totalSlots: number, usedSlots: Set<number>): number | null {
  for (let slot = 1; slot <= totalSlots; slot += 1) {
    if (!usedSlots.has(slot)) {
      return slot;
    }
  }

  return null;
}

export async function approveOrder(orderIdInput: string): Promise<ApproveOrderResult> {
  void SYSTEM_CONTRACT_PATH;

  const orderId = orderIdInput.trim();
  if (!orderId) {
    return {
      ok: false,
      error: { code: "INVALID_INPUT", message: "orderId is required" },
      statusCode: 400,
    };
  }

  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
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
                  accountId: true,
                  slotNumber: true,
                  expiresAt: true,
                },
              },
              plan: {
                select: {
                  serviceId: true,
                  durationInDays: true,
                },
              },
            },
          });

          if (!order) {
            throw new ApprovalError("NOT_FOUND", "Order not found", 404);
          }

          // Idempotent success: if order was already approved with assignment, return it.
          if (order.status === "APPROVED" && order.assignment) {
            return {
              orderId: order.id,
              status: "APPROVED" as const,
              accountId: order.assignment.accountId,
              slotNumber: order.assignment.slotNumber,
              expiresAt: order.assignment.expiresAt.toISOString(),
            };
          }

          if (order.status !== "PENDING") {
            throw new ApprovalError(
              "ORDER_NOT_PENDING",
              "Order is not pending and cannot be approved",
              409,
            );
          }

          if (order.assignment) {
            throw new ApprovalError(
              "ORDER_NOT_PENDING",
              "Order already has an assignment",
              409,
            );
          }

        const candidateAccounts = await tx.account.findMany({
          where: {
            serviceId: order.plan.serviceId,
            isActive: true,
            availableSlots: {
              gt: 0,
            },
          },
          select: {
            id: true,
            totalSlots: true,
            availableSlots: true,
          },
          orderBy: [{ availableSlots: "desc" }, { createdAt: "asc" }],
        });

        const now = new Date();
        const expiresAt = new Date(
          now.getTime() + order.plan.durationInDays * 24 * 60 * 60 * 1000,
        );

        for (const account of candidateAccounts) {
          if (account.totalSlots <= 0) {
            continue;
          }

          if (account.availableSlots > account.totalSlots || account.availableSlots < 0) {
            continue;
          }

          const activeAssignments = await tx.orderAssignment.findMany({
            where: {
              accountId: account.id,
              expiresAt: {
                gt: now,
              },
            },
            select: { slotNumber: true },
          });

          const usedSlots = new Set(activeAssignments.map((item) => item.slotNumber));
          const freeSlot = computeAvailableSlot(account.totalSlots, usedSlots);
          if (!freeSlot) {
            continue;
          }

          const decremented = await tx.account.updateMany({
            where: {
              id: account.id,
              isActive: true,
              availableSlots: account.availableSlots,
              totalSlots: {
                gte: account.availableSlots,
              },
            },
            data: {
              availableSlots: {
                decrement: 1,
              },
            },
          });

          if (decremented.count !== 1) {
            continue;
          }

          await tx.orderAssignment.create({
            data: {
              orderId: order.id,
              accountId: account.id,
              slotNumber: freeSlot,
              expiresAt,
            },
          });

          const orderUpdated = await tx.order.updateMany({
            where: {
              id: order.id,
              status: "PENDING",
            },
            data: {
              status: "APPROVED",
            },
          });

          if (orderUpdated.count !== 1) {
            throw new ApprovalError(
              "ORDER_NOT_PENDING",
              "Order was already processed by another transaction",
              409,
            );
          }

          return {
            orderId: order.id,
            status: "APPROVED" as const,
            accountId: account.id,
            slotNumber: freeSlot,
            expiresAt: expiresAt.toISOString(),
          };
        }

          throw new ApprovalError(
            "NO_AVAILABLE_ACCOUNT",
            "No active account with available slots for this plan",
            409,
          );
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      );

      return {
        ok: true,
        data: approved,
      };
    } catch (error) {
      if (error instanceof ApprovalError) {
        return {
          ok: false,
          error: {
            code: error.code,
            message: error.message,
          },
          statusCode: error.statusCode,
        };
      }

      if (isSerializableConflict(error) && attempt < maxRetries) {
        continue;
      }

      console.error("approveOrder failed:", error);
      return {
        ok: false,
        error: {
          code: "INVALID_INPUT",
          message: "Approval failed due to an unexpected error",
        },
        statusCode: 500,
      };
    }
  }

  return {
    ok: false,
    error: {
      code: "INVALID_INPUT",
      message: "Approval failed due to repeated transaction conflicts",
    },
    statusCode: 500,
  };
}
