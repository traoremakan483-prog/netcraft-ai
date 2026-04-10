"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

const PROJECT_TYPES = [
  { value: "LAN", label: "LAN", desc: "Local Area Network" },
  { value: "WAN", label: "WAN", desc: "Wide Area Network" },
  { value: "LAN_WAN", label: "LAN + WAN", desc: "Combined topology" },
] as const;

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const body = {
      name: fd.get("name") as string,
      description: (fd.get("description") as string) || undefined,
      type: fd.get("type") as string,
      baseNetwork: (fd.get("baseNetwork") as string) || undefined,
    };

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(
        typeof data.error === "string"
          ? data.error
          : "Validation failed. Check your inputs."
      );
      setLoading(false);
      return;
    }

    const project = await res.json();
    router.push(`/projects/${project.id}`);
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to projects
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50">
          New Project
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Define your network project and base addressing.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500"
          >
            Project name *
          </label>
          <input
            id="name"
            name="name"
            required
            maxLength={100}
            placeholder="e.g. Campus Network HQ"
            className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            maxLength={500}
            placeholder="Optional project notes…"
            className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Type */}
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
            Network type
          </label>
          <div className="grid grid-cols-3 gap-3">
            {PROJECT_TYPES.map((t) => (
              <label
                key={t.value}
                className="relative cursor-pointer rounded-md border border-zinc-700 bg-zinc-900 p-3 text-center transition-colors hover:border-zinc-600 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-500/10"
              >
                <input
                  type="radio"
                  name="type"
                  value={t.value}
                  defaultChecked={t.value === "LAN"}
                  className="sr-only"
                />
                <p className="text-sm font-semibold text-zinc-100">
                  {t.label}
                </p>
                <p className="mt-0.5 text-[10px] text-zinc-500">{t.desc}</p>
              </label>
            ))}
          </div>
        </div>

        {/* Base Network */}
        <div>
          <label
            htmlFor="baseNetwork"
            className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500"
          >
            Base network (CIDR)
          </label>
          <input
            id="baseNetwork"
            name="baseNetwork"
            placeholder="e.g. 192.168.0.0/16 or 10.0.0.0/8"
            className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="mt-1 text-[10px] text-zinc-600">
            Address space used for VLSM calculation. Leave empty to set later.
          </p>
        </div>

        {error && (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating…
            </>
          ) : (
            "Create Project"
          )}
        </button>
      </form>
    </div>
  );
}
