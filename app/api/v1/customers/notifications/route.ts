import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone");

  if (!phone) {
    return NextResponse.json({ error: "Telefone é obrigatório" }, { status: 400 });
  }

  try {
    // Find customer by phone
    const customer = await prisma.customer.findFirst({
      where: { phone: phone.replace(/\D/g, "") },
    });

    if (!customer) {
      return NextResponse.json([]);
    }

    const notifications = await prisma.notification.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
