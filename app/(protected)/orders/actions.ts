"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { cancelOrderSchema } from "@/lib/validations/order";

export async function cancelOrderAction(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Non autorisé");
  }

  const parsed = cancelOrderSchema.safeParse({
    orderId: formData.get("orderId"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const { orderId } = parsed.data;

  await prisma.order.updateMany({
    where: {
      id: orderId,
      userId: session.user.id,
      orderType: "LIMIT",
      status: "PENDING",
    },
    data: {
      status: "CANCELLED",
    },
  });

  revalidatePath("/orders");
}