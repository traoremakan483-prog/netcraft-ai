"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tag, Loader2 } from "lucide-react";

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
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Tag className="h-4 w-4" />
          )}
          {vlans.length > 0 ? "Regenerate VLANs" : "Auto-suggest VLANs"}
        </button>

        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>

      {vlans.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900 text-[10px] uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-4 py-2">VLAN #</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Assigned Departments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {vlans.map((v) => (
                <tr
                  key={v.id}
                  className="text-zinc-300 transition-colors hover:bg-zinc-900/60"
                >
                  <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs font-semibold text-blue-400">
                    {v.number}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-zinc-100">
                    {v.name}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-zinc-500">
                    {v.description ?? "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    {v.departments.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {v.departments.map((d) => (
                          <span
                            key={d.id}
                            className="rounded-full border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-300"
                          >
                            {d.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-zinc-600">
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
        <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-900/40 p-10 text-center">
          <Tag className="mx-auto h-10 w-10 text-zinc-700" />
          <h2 className="mt-3 text-lg font-semibold text-zinc-100">
            No VLANs yet
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Click &quot;Auto-suggest VLANs&quot; to generate VLAN assignments
            from your department types.
          </p>
        </div>
      )}
    </div>
  );
}
