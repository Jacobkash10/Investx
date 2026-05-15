"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { markNotificationAsReadSchema } from "@/lib/validations/notification";

export async function markNotificationAsReadAction(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Non autorisé");
  }

  const parsed = markNotificationAsReadSchema.safeParse({
    notificationId: formData.get("notificationId"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const { notificationId } = parsed.data;

  await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId: session.user.id,
    },
    data: {
      isRead: true,
    },
  });

  revalidatePath("/notifications");
}

export async function markAllNotificationsAsReadAction() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Non autorisé");
  }

  await prisma.notification.updateMany({
    where: {
      userId: session.user.id,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  revalidatePath("/notifications");
}