import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        offer: {
          include: {
            service: true
          }
        },
        assignment: {
          include: {
            profile: {
              include: {
                account: true
              }
            }
          }
        }
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    // Extract info for renewal
    const renewalInfo = {
      orderId: order.id,
      customerName: order.customer.name,
      customerPhone: order.customer.phone,
      serviceName: order.offer.service.name,
      serviceId: order.offer.serviceId,
      lastAssignment: order.assignment || null,
    };

    return NextResponse.json(renewalInfo);
  } catch (error) {
    console.error("Error fetching renewal info:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
