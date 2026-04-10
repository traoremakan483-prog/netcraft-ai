"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calculator, Loader2, AlertTriangle } from "lucide-react";
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
  const usagePercent = totalSpace > 0 ? Math.round((usedSpace / totalSpace) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Calculate button + summary */}
      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={handleCalculate}
          disabled={loading || !hasBaseNetwork}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Calculator className="h-4 w-4" />
          )}
          {subnets.length > 0 ? "Recalculate VLSM" : "Calculate VLSM"}
        </button>

        {!hasBaseNetwork && (
          <p className="text-sm text-amber-400">
            Set a base network on the project first.
          </p>
        )}

        {subnets.length > 0 && (
          <div className="flex items-center gap-6 text-xs text-zinc-400">
            <span>
              Total: <b className="font-mono text-zinc-200">{totalSpace}</b>
            </span>
            <span>
              Used: <b className="font-mono text-zinc-200">{usedSpace}</b>
            </span>
            <span>
              Remaining:{" "}
              <b className="font-mono text-zinc-200">{remaining}</b>
            </span>
            <span>
              Usage:{" "}
              <b
                className={cn(
                  "font-mono",
                  usagePercent > 90
                    ? "text-red-400"
                    : usagePercent > 70
                      ? "text-amber-400"
                      : "text-green-400"
                )}
              >
                {usagePercent}%
              </b>
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* VLSM Table */}
      {subnets.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 border-b border-zinc-800 bg-zinc-900 text-[10px] uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-3 py-2">Department</th>
                <th className="px-3 py-2">Network</th>
                <th className="px-3 py-2">Mask</th>
                <th className="px-3 py-2">CIDR</th>
                <th className="px-3 py-2">First</th>
                <th className="px-3 py-2">Last</th>
                <th className="px-3 py-2">Broadcast</th>
                <th className="px-3 py-2">Gateway</th>
                <th className="px-3 py-2">Wildcard</th>
                <th className="px-3 py-2 text-right">Capacity</th>
                <th className="px-3 py-2 text-right">Util.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {subnets.map((s) => (
                <tr
                  key={s.id}
                  className="text-zinc-300 transition-colors hover:bg-zinc-900/60"
                >
                  <td className="whitespace-nowrap px-3 py-2 font-medium text-zinc-100">
                    {s.departmentName}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">
                    {s.networkAddress}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">
                    {s.subnetMask}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">
                    /{s.cidr}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">
                    {s.firstHost}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">
                    {s.lastHost}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">
                    {s.broadcastAddress}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-blue-400">
                    {s.gatewayAddress}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">
                    {s.wildcardMask}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-right font-mono text-xs">
                    {s.requestedHosts}/{s.usableHosts}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-right">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 font-mono text-[10px]",
                        s.utilization > 80
                          ? "bg-amber-500/10 text-amber-400"
                          : s.utilization > 100
                            ? "bg-red-500/10 text-red-400"
                            : "bg-green-500/10 text-green-400"
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
        <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-900/40 p-10 text-center">
          <Calculator className="mx-auto h-10 w-10 text-zinc-700" />
          <h2 className="mt-3 text-lg font-semibold text-zinc-100">
            No subnets calculated yet
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Click &quot;Calculate VLSM&quot; to auto-generate subnets for all
            departments.
          </p>
        </div>
      )}
    </div>
  );
}
