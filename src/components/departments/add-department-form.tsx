"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const DEPT_TYPES = [
  { value: "IT", label: "IT" },
  { value: "SALES", label: "Sales" },
  { value: "HR", label: "HR" },
  { value: "MANAGEMENT", label: "Management" },
  { value: "SERVER_ROOM", label: "Server Room" },
  { value: "RECEPTION", label: "Reception" },
  { value: "OPEN_SPACE", label: "Open Space" },
  { value: "MEETING_ROOM", label: "Meeting Room" },
  { value: "SECURITY", label: "Security" },
  { value: "CUSTOM", label: "Custom" },
];

export function AddDepartmentForm({
  projectId,
  branchId,
}: {
  projectId: string;
  branchId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-lg border border-dashed border-zinc-800 bg-zinc-900/40 py-3 text-sm text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
      >
        + Add Department
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    const res = await fetch(
      `/api/projects/${projectId}/branches/${branchId}/departments`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          type: fd.get("type"),
          estimatedHosts: Number(fd.get("estimatedHosts")) || 10,
        }),
      }
    );

    if (res.ok) {
      setOpen(false);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4"
    >
      <div className="min-w-[140px] flex-1">
        <label className="mb-1 block text-[10px] uppercase tracking-wider text-zinc-500">
          Name *
        </label>
        <input
          name="name"
          required
          placeholder="e.g. IT Department"
          className="h-9 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div className="w-36">
        <label className="mb-1 block text-[10px] uppercase tracking-wider text-zinc-500">
          Type
        </label>
        <select
          name="type"
          defaultValue="CUSTOM"
          className="h-9 w-full rounded-md border border-zinc-700 bg-zinc-950 px-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
        >
          {DEPT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <div className="w-24">
        <label className="mb-1 block text-[10px] uppercase tracking-wider text-zinc-500">
          Hosts
        </label>
        <input
          name="estimatedHosts"
          type="number"
          min={1}
          max={10000}
          defaultValue={10}
          className="h-9 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="h-9 rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="h-9 rounded-md border border-zinc-700 px-3 text-sm text-zinc-400 hover:text-zinc-200"
      >
        Cancel
      </button>
    </form>
  );
}
