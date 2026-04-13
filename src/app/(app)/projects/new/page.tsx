"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";

const PROJECT_TYPES = [
  { value: "LAN", label: "LAN", desc: "Local Area Network", emoji: "🏢" },
  { value: "WAN", label: "WAN", desc: "Wide Area Network", emoji: "🌐" },
  { value: "LAN_WAN", label: "LAN + WAN", desc: "Combined topology", emoji: "🔗" },
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
    <div className="mx-auto max-w-xl space-y-6 animate-fade-in">
      <div>
        <Link
          href="/projects"
          className="group inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
          Back to projects
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-zinc-50">
          New Project
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500">
          Define your network project and base addressing.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-6 backdrop-blur-sm"
      >
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-xs font-semibold uppercase tracking-widest text-zinc-500"
          >
            Project name *
          </label>
          <input
            id="name"
            name="name"
            required
            maxLength={100}
            placeholder="e.g. Campus Network HQ"
            className="h-11 w-full rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-4 text-sm text-zinc-100 placeholder:text-zinc-600 transition-all duration-200 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:shadow-lg focus:shadow-blue-500/5"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-xs font-semibold uppercase tracking-widest text-zinc-500"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            maxLength={500}
            placeholder="Optional project notes..."
            className="w-full rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 transition-all duration-200 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:shadow-lg focus:shadow-blue-500/5"
          />
        </div>

        {/* Type */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Network type
          </label>
          <div className="grid grid-cols-3 gap-3">
            {PROJECT_TYPES.map((t) => (
              <label
                key={t.value}
                className="group relative cursor-pointer rounded-xl border border-zinc-700/60 bg-zinc-900/60 p-4 text-center transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-800/60 has-[:checked]:border-blue-500/50 has-[:checked]:bg-blue-500/10 has-[:checked]:shadow-lg has-[:checked]:shadow-blue-500/5"
              >
                <input
                  type="radio"
                  name="type"
                  value={t.value}
                  defaultChecked={t.value === "LAN"}
                  className="sr-only"
                />
                <div className="text-lg">{t.emoji}</div>
                <p className="mt-1 text-sm font-bold text-zinc-100">
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
            className="mb-2 block text-xs font-semibold uppercase tracking-widest text-zinc-500"
          >
            Base network (CIDR)
          </label>
          <input
            id="baseNetwork"
            name="baseNetwork"
            placeholder="e.g. 192.168.0.0/16 or 10.0.0.0/8"
            className="h-11 w-full rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-4 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 transition-all duration-200 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:shadow-lg focus:shadow-blue-500/5"
          />
          <p className="mt-1.5 text-[10px] text-zinc-600">
            Address space used for VLSM calculation. Leave empty to set later.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:shadow-blue-500/40 hover:brightness-110 disabled:opacity-50 disabled:hover:shadow-blue-500/20 disabled:hover:brightness-100"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Create Project
            </>
          )}
        </button>
      </form>
    </div>
  );
}
