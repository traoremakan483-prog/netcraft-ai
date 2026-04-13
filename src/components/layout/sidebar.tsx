"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  Network,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-14 items-center justify-between border-b border-zinc-800/60 px-4">
        <Link href="/dashboard" className="group flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 shadow-md shadow-blue-500/20 transition-shadow duration-300 group-hover:shadow-blue-500/40">
            <Network className="h-4 w-4 text-white" />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 to-transparent" />
          </div>
          <span className="font-bold tracking-tight text-zinc-50">
            NetCraft{" "}
            <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
              AI
            </span>
          </span>
        </Link>
        <button
          onClick={() => setOpen(false)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4">
        <p className="px-2 pb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
          Navigation
        </p>
        <ul className="space-y-1">
          {NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-blue-500/10 text-blue-400"
                      : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100"
                  )}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
                  )}
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      active ? "text-blue-400" : "text-zinc-500 group-hover:text-zinc-300"
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Pro badge */}
      <div className="mx-3 mb-3 rounded-xl border border-zinc-800/60 bg-gradient-to-br from-zinc-900 to-zinc-900/60 p-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-semibold text-zinc-200">
            NetCraft AI
          </span>
        </div>
        <p className="mt-1 text-[10px] leading-relaxed text-zinc-500">
          Network automation platform
        </p>
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-800/60 px-4 py-3 text-[11px] text-zinc-600">
        <span className="font-mono">v1.0.0</span>
        <span className="mx-2 text-zinc-800">·</span>
        <span>Built with precision</span>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed left-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950/90 text-zinc-400 shadow-lg backdrop-blur-sm transition-all hover:border-zinc-700 hover:text-zinc-100 md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm animate-fade-in md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-800/60 bg-zinc-950/95 backdrop-blur-xl transition-transform duration-300 ease-out md:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden border-r border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm md:flex md:w-60 md:shrink-0 md:flex-col">
        {sidebarContent}
      </aside>
    </>
  );
}
