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
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ClipboardCheck className="h-4 w-4" />
          )}
          Run Validation
        </button>

        {summary && (
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-red-400">
              <AlertCircle className="h-3 w-3" />
              {summary.errors} errors
            </span>
            <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-amber-400">
              <AlertTriangle className="h-3 w-3" />
              {summary.warnings} warnings
            </span>
            <span className="flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-blue-400">
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
        <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-8 text-center">
          <ClipboardCheck className="mx-auto h-10 w-10 text-green-500" />
          <h2 className="mt-3 text-lg font-semibold text-green-400">
            All clear
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            No issues found. Your network design looks good.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-900/40 p-10 text-center">
          <ClipboardCheck className="mx-auto h-10 w-10 text-zinc-700" />
          <h2 className="mt-3 text-lg font-semibold text-zinc-100">
            Not validated yet
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Click &quot;Run Validation&quot; to check for errors and best
            practices.
          </p>
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
      <h3 className={cn("mb-2 flex items-center gap-2 text-sm font-semibold", c.text)}>
        <Icon className="h-4 w-4" />
        {title} ({items.length})
      </h3>
      <div className={cn("divide-y divide-zinc-800 rounded-lg border", c.border, c.bg)}>
        {items.map((item, i) => (
          <div key={i} className="px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-zinc-200">{item.message}</p>
                {item.target && (
                  <span className="mt-0.5 inline-block rounded border border-zinc-700 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                    {item.target}
                  </span>
                )}
              </div>
              <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px]", c.badge)}>
                {item.category}
              </span>
            </div>
            {item.fix && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-zinc-500">
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
