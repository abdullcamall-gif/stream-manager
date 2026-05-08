import { SYSTEM_CONTRACT_PATH } from "@/lib/contract";
import {
  createOrderWithCustomer,
  isPlanAvailable,
} from "@/lib/repositories/order.repository";
import { PaymentMethod } from "@prisma/client";

const PHONE_REGEX = /^\+?[0-9]{8,15}$/;

export type CreateOrderRequest = {
  name: string;
  phone: string;
  planId: string;
  paymentMethod: string;
  proofImageUrl: string;
};

export type CreateOrderResult =
  | {
      ok: true;
      data: {
        id: string;
        status: "PENDING" | "APPROVED" | "REJECTED";
      };
    }
  | {
      ok: false;
      error: string;
      statusCode: number;
    };

function normalizePaymentMethod(value: string): PaymentMethod | null {
  const normalized = value.trim().toUpperCase();
  if (
    normalized === PaymentMethod.EMOLA ||
    normalized === PaymentMethod.MPESA ||
    normalized === PaymentMethod.BCI ||
    normalized === PaymentMethod.BIM
  ) {
    return normalized;
  }

  return null;
}

export async function createManualOrder(
  payload: CreateOrderRequest,
): Promise<CreateOrderResult> {
  void SYSTEM_CONTRACT_PATH;

  const name = payload.name.trim();
  const phone = payload.phone.trim();
  const planId = payload.planId.trim();
  const proofImageUrl = payload.proofImageUrl.trim();
  const paymentMethod = normalizePaymentMethod(payload.paymentMethod);

  if (!name) {
    return { ok: false, error: "name is required", statusCode: 400 };
  }

  if (!phone) {
    return { ok: false, error: "phone is required", statusCode: 400 };
  }

  if (!PHONE_REGEX.test(phone)) {
    return {
      ok: false,
      error: "phone must be a valid phone number",
      statusCode: 400,
    };
  }

  if (!planId) {
    return { ok: false, error: "planId is required", statusCode: 400 };
  }

  if (!paymentMethod) {
    return { ok: false, error: "paymentMethod is invalid", statusCode: 400 };
  }

  if (!proofImageUrl) {
    return { ok: false, error: "proofImageUrl is required", statusCode: 400 };
  }

  const planIsValid = await isPlanAvailable(planId);
  if (!planIsValid) {
    return { ok: false, error: "planId is invalid", statusCode: 400 };
  }

  const order = await createOrderWithCustomer({
    name,
    phone,
    planId,
    paymentMethod,
    proofImageUrl,
  });

  return {
    ok: true,
    data: order,
  };
}
