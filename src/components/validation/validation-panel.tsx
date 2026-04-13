"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardCheck,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Info,
  Wrench,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ValidationItem {
  severity: "error" | "warning" | "recommendation";
  category: string;
  message: string;
  target?: string;
  fix?: string;
}

interface Summary {
  errors: number;
  warnings: number;
  recommendations: number;
}

export function ValidationPanel({
  projectId,
  initialItems,
  initialSummary,
}: {
  projectId: string;
  initialItems: ValidationItem[];
  initialSummary: Summary | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState(initialItems);
  const [summary, setSummary] = useState(initialSummary);

  async function handleValidate() {
    setLoading(true);
    const res = await fetch(`/api/projects/${projectId}/validate`);
    const data = await res.json();
    setItems(data.items ?? []);
    setSummary(data.summary ?? null);
    setLoading(false);
    router.refresh();
  }

  const errors = items.filter((i) => i.severity === "error");
  const warnings = items.filter((i) => i.severity === "warning");
  const recs = items.filter((i) => i.severity === "recommendation");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={handleValidate}
          disabled={loading}
          className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:shadow-blue-500/40 hover:brightness-110 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ClipboardCheck className="h-4 w-4" />
          )}
          Run Validation
        </button>

        {summary && (
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5 font-semibold text-red-400">
              <AlertCircle className="h-3 w-3" />
              {summary.errors} errors
            </span>
            <span className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-3 py-1.5 font-semibold text-amber-400">
              <AlertTriangle className="h-3 w-3" />
              {summary.warnings} warnings
            </span>
            <span className="flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-3 py-1.5 font-semibold text-blue-400">
              <Info className="h-3 w-3" />
              {summary.recommendations} recs
            </span>
          </div>
        )}
      </div>

      {items.length > 0 ? (
        <div className="space-y-6">
          {errors.length > 0 && (
            <Section
              title="Errors"
              items={errors}
              color="red"
              icon={AlertCircle}
            />
          )}
          {warnings.length > 0 && (
            <Section
              title="Warnings"
              items={warnings}
              color="amber"
              icon={AlertTriangle}
            />
          )}
          {recs.length > 0 && (
            <Section
              title="Recommendations"
              items={recs}
              color="blue"
              icon={Info}
            />
          )}
        </div>
      ) : summary ? (
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-10 text-center">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
          </div>
          <div className="relative">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
              <ShieldCheck className="h-7 w-7 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-emerald-400">All clear</h2>
            <p className="mt-2 text-sm text-zinc-400">
              No issues found. Your network design looks good.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 p-12 text-center">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />
          </div>
          <div className="relative">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800/60 text-zinc-500">
              <Sparkles className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-bold text-zinc-100">
              Not validated yet
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Click &quot;Run Validation&quot; to check for errors and best
              practices.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  items,
  color,
  icon: Icon,
}: {
  title: string;
  items: ValidationItem[];
  color: "red" | "amber" | "blue";
  icon: React.ComponentType<{ className?: string }>;
}) {
  const colorMap = {
    red: {
      border: "border-red-500/20",
      bg: "bg-red-500/5",
      text: "text-red-400",
      badge: "bg-red-500/10 text-red-400",
    },
    amber: {
      border: "border-amber-500/20",
      bg: "bg-amber-500/5",
      text: "text-amber-400",
      badge: "bg-amber-500/10 text-amber-400",
    },
    blue: {
      border: "border-blue-500/20",
      bg: "bg-blue-500/5",
      text: "text-blue-400",
      badge: "bg-blue-500/10 text-blue-400",
    },
  };
  const c = colorMap[color];

  return (
    <div>
      <h3
        className={cn(
          "mb-3 flex items-center gap-2 text-sm font-bold",
          c.text
        )}
      >
        <Icon className="h-4 w-4" />
        {title} ({items.length})
      </h3>
      <div
        className={cn(
          "divide-y divide-zinc-800/40 overflow-hidden rounded-xl border",
          c.border,
          c.bg
        )}
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="px-4 py-3.5 transition-colors hover:bg-white/[0.02]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-zinc-200">
                  {item.message}
                </p>
                {item.target && (
                  <span className="mt-1 inline-block rounded-md border border-zinc-700/60 bg-zinc-800/60 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                    {item.target}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-semibold",
                  c.badge
                )}
              >
                {item.category}
              </span>
            </div>
            {item.fix && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500">
                <Wrench className="h-3 w-3" />
                {item.fix}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
