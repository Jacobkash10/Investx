"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { usePathname } from "next/navigation";

interface NotificationBadgeProps {
  unreadCount?: number;
}

export function NotificationBadge({
  unreadCount = 0,
}: NotificationBadgeProps) {
  const pathname = usePathname();

  const isActive = pathname === "/notifications";

  return (
    <Link
      href="/notifications"
      className={`relative flex h-11 w-11 items-center justify-center rounded-2xl transition ${
        isActive
          ? "bg-emerald-400 text-slate-950"
          : "border-white/10 bg-white/5 hover:bg-white/10 text-white border"
      }`}
    >
      <Bell size={20} />

      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#020617] bg-red-500 px-1 text-[11px] font-black text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}