"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { LogoutButton } from "@/components/logout-button";
import { NotificationBadge } from "@/components/notification-badge";

import {
  LayoutDashboard,
  ChartCandlestick,
  BriefcaseBusiness,
  ArrowLeftRight,
  Bell,
  Eye,
  BarChart3,
  User,
  Menu,
  X,
  MoreHorizontal,
} from "lucide-react";

const mainItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/market", label: "Market", icon: ChartCandlestick },
  { href: "/portfolio", label: "Portfolio", icon: BriefcaseBusiness },
  { href: "/orders", label: "Orders", icon: ArrowLeftRight },
  { href: "/alerts", label: "Alerts", icon: Bell },
];

const moreItems = [
  { href: "/watchlist", label: "Watchlist", icon: Eye },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
];

const allItems = [...mainItems, ...moreItems];

export function Navbar({
  unreadCount = 0,
}: {
  unreadCount?: number;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const isMoreActive = moreItems.some((item) => pathname === item.href);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#020617]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-2xl font-black tracking-tight text-white"
        >
          Invest<span className="text-emerald-400">X</span>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden items-center gap-2 lg:flex">
          {mainItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-emerald-400 text-slate-950"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}

          {/* MORE DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                isMoreActive
                  ? "bg-emerald-400 text-slate-950"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <MoreHorizontal size={18} />
              More
            </button>

            {moreOpen && (
              <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-white/10 bg-[#020617] p-2 shadow-2xl shadow-black/40">
                {moreItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                        isActive
                          ? "bg-emerald-400/15 text-emerald-400"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <NotificationBadge unreadCount={unreadCount} />
          </div>

          <div className="hidden md:block">
            <LogoutButton />
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white lg:hidden"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="border-t border-slate-800 bg-[#020617] px-4 py-4 lg:hidden">
          <nav className="grid gap-2">
            {allItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-emerald-400 text-slate-950"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-4">
            <NotificationBadge />
            <LogoutButton />
          </div>
        </div>
      )}
    </header>
  );
}