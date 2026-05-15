"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  updateProfileSchema,
  changePasswordSchema,
} from "@/lib/validations/profile";

export async function updateProfileAction(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Non autorisé");
  }

  const preferredCurrency = String(
    formData.get("preferredCurrency") || "USD"
  );

  const parsed = updateProfileSchema.safeParse({
    name: formData.get("name"),
    image: formData.get("image"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const { name, image } = parsed.data;

  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      name,
      image: image || null,
      preferredCurrency: preferredCurrency === "EUR" ? "EUR" : "USD",
    },
  });

  revalidatePath("/profile");
}

export async function changePasswordAction(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Non autorisé");
  }

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const { currentPassword, newPassword } = parsed.data;

  await auth.api.changePassword({
    headers: await headers(),
    body: {
      currentPassword,
      newPassword,
    },
  });

  revalidatePath("/profile");
}