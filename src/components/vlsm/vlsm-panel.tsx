"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calculator, Loader2, AlertTriangle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubnetRow {
  id: string;
  departmentName: string;
  networkAddress: string;
  broadcastAddress: string;
  subnetMask: string;
  cidr: number;
  firstHost: string;
  lastHost: string;
  wildcardMask: string;
  gatewayAddress: string;
  totalHosts: number;
  usableHosts: number;
  requestedHosts: number;
  utilization: number;
}

interface VlsmPanelProps {
  projectId: string;
  hasBaseNetwork: boolean;
  subnets: SubnetRow[];
  totalSpace: number;
  usedSpace: number;
}

export function VlsmPanel({
  projectId,
  hasBaseNetwork,
  subnets,
  totalSpace,
  usedSpace,
}: VlsmPanelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCalculate() {
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/projects/${projectId}/vlsm`, {
      method: "POST",
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "VLSM calculation failed");
      setLoading(false);
      return;
    }

    if (data.errors?.length > 0) {
      setError(data.errors.join(" | "));
    }

    setLoading(false);
    router.refresh();
  }

  const remaining = totalSpace - usedSpace;
  const usagePercent =
    totalSpace > 0 ? Math.round((usedSpace / totalSpace) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={handleCalculate}
          disabled={loading || !hasBaseNetwork}
          className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:shadow-blue-500/40 hover:brightness-110 disabled:opacity-50 disabled:hover:shadow-blue-500/20"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Calculator className="h-4 w-4" />
          )}
          {subnets.length > 0 ? "Recalculate VLSM" : "Calculate VLSM"}
        </button>

        {!hasBaseNetwork && (
          <p className="text-sm font-medium text-amber-400">
            Set a base network on the project first.
          </p>
        )}

        {subnets.length > 0 && (
          <div className="flex items-center gap-4 text-xs text-zinc-400">
            <span className="rounded-lg bg-zinc-800/60 px-3 py-1.5">
              Total: <b className="font-mono text-zinc-200">{totalSpace}</b>
            </span>
            <span className="rounded-lg bg-zinc-800/60 px-3 py-1.5">
              Used: <b className="font-mono text-zinc-200">{usedSpace}</b>
            </span>
            <span className="rounded-lg bg-zinc-800/60 px-3 py-1.5">
              Free: <b className="font-mono text-zinc-200">{remaining}</b>
            </span>
            <span className="rounded-lg bg-zinc-800/60 px-3 py-1.5">
              Usage:{" "}
              <b
                className={cn(
                  "font-mono",
                  usagePercent > 90
                    ? "text-red-400"
                    : usagePercent > 70
                      ? "text-amber-400"
                      : "text-emerald-400"
                )}
              >
                {usagePercent}%
              </b>
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Table */}
      {subnets.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-zinc-800/60">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 border-b border-zinc-800/60 bg-zinc-900/80 backdrop-blur-sm text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              <tr>
                <th className="px-3 py-3">Department</th>
                <th className="px-3 py-3">Network</th>
                <th className="px-3 py-3">Mask</th>
                <th className="px-3 py-3">CIDR</th>
                <th className="px-3 py-3">First</th>
                <th className="px-3 py-3">Last</th>
                <th className="px-3 py-3">Broadcast</th>
                <th className="px-3 py-3">Gateway</th>
                <th className="px-3 py-3">Wildcard</th>
                <th className="px-3 py-3 text-right">Capacity</th>
                <th className="px-3 py-3 text-right">Util.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {subnets.map((s) => (
                <tr
                  key={s.id}
                  className="text-zinc-300 transition-colors duration-150 hover:bg-zinc-800/30"
                >
                  <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-zinc-100">
                    {s.departmentName}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs">
                    {s.networkAddress}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs">
                    {s.subnetMask}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs text-blue-400">
                    /{s.cidr}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs">
                    {s.firstHost}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs">
                    {s.lastHost}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs">
                    {s.broadcastAddress}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs text-blue-400">
                    {s.gatewayAddress}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs text-zinc-500">
                    {s.wildcardMask}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-xs">
                    {s.requestedHosts}/{s.usableHosts}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right">
                    <span
                      className={cn(
                        "inline-flex min-w-[3rem] justify-center rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold",
                        s.utilization > 80
                          ? "bg-amber-500/10 text-amber-400"
                          : s.utilization > 100
                            ? "bg-red-500/10 text-red-400"
                            : "bg-emerald-500/10 text-emerald-400"
                      )}
                    >
                      {s.utilization}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {subnets.length === 0 && hasBaseNetwork && !error && (
        <div className="relative overflow-hidden rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 p-12 text-center">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />
          </div>
          <div className="relative">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800/60 text-zinc-500">
              <Sparkles className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-bold text-zinc-100">
              No subnets calculated yet
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Click &quot;Calculate VLSM&quot; to auto-generate subnets for all
              departments.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
