import { Navbar } from "@/components/navbar";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/connexion");
  }

  const unreadCount = await prisma.notification.count({
    where: {
      userId: session.user.id,
      isRead: false,
    },
  });

  return (
    <>
      <Navbar unreadCount={unreadCount} />
      {children}
    </>
  );
}