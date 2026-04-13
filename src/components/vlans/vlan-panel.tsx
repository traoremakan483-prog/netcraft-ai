"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tag, Loader2, Sparkles } from "lucide-react";

interface VlanRow {
  id: string;
  number: number;
  name: string;
  description: string | null;
  departments: { id: string; name: string }[];
}

export function VlanPanel({
  projectId,
  vlans: initialVlans,
}: {
  projectId: string;
  vlans: VlanRow[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const vlans = initialVlans;

  async function handleSuggest() {
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/projects/${projectId}/vlans`, {
      method: "POST",
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to suggest VLANs");
      setLoading(false);
      return;
    }

    setLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={handleSuggest}
          disabled={loading}
          className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:shadow-blue-500/40 hover:brightness-110 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Tag className="h-4 w-4" />
          )}
          {vlans.length > 0 ? "Regenerate VLANs" : "Auto-suggest VLANs"}
        </button>

        {error && <p className="text-sm font-medium text-red-400">{error}</p>}
      </div>

      {vlans.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-zinc-800/60">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800/60 bg-zinc-900/80 backdrop-blur-sm text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              <tr>
                <th className="px-4 py-3">VLAN #</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Assigned Departments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {vlans.map((v) => (
                <tr
                  key={v.id}
                  className="text-zinc-300 transition-colors duration-150 hover:bg-zinc-800/30"
                >
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-bold text-blue-400">
                    {v.number}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold text-zinc-100">
                    {v.name}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {v.description ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {v.departments.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {v.departments.map((d) => (
                          <span
                            key={d.id}
                            className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-medium text-blue-300"
                          >
                            {d.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] italic text-zinc-600">
                        {v.number === 99
                          ? "Native trunk"
                          : v.number === 999
                            ? "Unused ports"
                            : "—"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {vlans.length === 0 && !error && (
        <div className="relative overflow-hidden rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 p-12 text-center">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />
          </div>
          <div className="relative">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800/60 text-zinc-500">
              <Sparkles className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-bold text-zinc-100">No VLANs yet</h2>
            <p className="mt-2 text-sm text-zinc-500">
              Click &quot;Auto-suggest VLANs&quot; to generate VLAN assignments
              from your department types.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
