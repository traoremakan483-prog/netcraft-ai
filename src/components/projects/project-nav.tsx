"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Network,
  Tag,
  Cog,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Overview", href: "", icon: LayoutDashboard },
  { label: "Subnets", href: "/subnets", icon: Network },
  { label: "VLANs", href: "/vlans", icon: Tag },
  { label: "Configs", href: "/configs", icon: Cog },
  { label: "Validation", href: "/validation", icon: ClipboardCheck },
];

export function ProjectNav({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const base = `/projects/${projectId}`;

  return (
    <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-zinc-800/60 pb-px">
      {TABS.map((tab) => {
        const href = `${base}${tab.href}`;
        const active =
          tab.href === "" ? pathname === base : pathname.startsWith(href);
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={href}
            className={cn(
              "group relative flex items-center gap-1.5 whitespace-nowrap px-4 py-2.5 text-xs font-semibold transition-all duration-200",
              active
                ? "text-blue-400"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Icon
              className={cn(
                "h-3.5 w-3.5 transition-colors",
                active ? "text-blue-400" : "text-zinc-600 group-hover:text-zinc-400"
              )}
            />
            {tab.label}
            {active && (
              <div className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
