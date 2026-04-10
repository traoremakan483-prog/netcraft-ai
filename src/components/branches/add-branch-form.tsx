"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function AddBranchForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-lg border border-dashed border-zinc-800 bg-zinc-900/40 py-4 text-sm text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
      >
        + Add Branch
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    const res = await fetch(`/api/projects/${projectId}/branches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        location: fd.get("location") || undefined,
      }),
    });

    if (res.ok) {
      setOpen(false);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4"
    >
      <div className="flex-1">
        <label className="mb-1 block text-[10px] uppercase tracking-wider text-zinc-500">
          Branch name *
        </label>
        <input
          name="name"
          required
          placeholder="e.g. HQ, Branch-KL"
          className="h-9 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div className="flex-1">
        <label className="mb-1 block text-[10px] uppercase tracking-wider text-zinc-500">
          Location
        </label>
        <input
          name="location"
          placeholder="e.g. Kuala Lumpur"
          className="h-9 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none"
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
