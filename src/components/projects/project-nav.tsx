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
    <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-zinc-800 pb-px">
      {TABS.map((tab) => {
        const href = `${base}${tab.href}`;
        const active =
          tab.href === ""
            ? pathname === base
            : pathname.startsWith(href);
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={href}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-xs font-medium transition-colors",
              active
                ? "border-blue-500 text-zinc-100"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
