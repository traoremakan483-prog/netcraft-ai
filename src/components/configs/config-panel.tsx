"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Cog, Loader2, Copy, Check, Download, Sparkles, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfigItem {
  id: string;
  type: string;
  content: string;
  deviceHostname: string;
  deviceName: string;
  deviceType: string;
}

export function ConfigPanel({
  projectId,
  configs: initialConfigs,
}: {
  projectId: string;
  configs: ConfigItem[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const configs = initialConfigs;

  async function handleGenerate() {
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/projects/${projectId}/configs`, {
      method: "POST",
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Config generation failed");
      setLoading(false);
      return;
    }

    setLoading(false);
    setActiveTab(0);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:shadow-blue-500/40 hover:brightness-110 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Cog className="h-4 w-4" />
          )}
          {configs.length > 0
            ? "Regenerate All Configs"
            : "Generate All Configs"}
        </button>
        {error && <p className="text-sm font-medium text-red-400">{error}</p>}
      </div>

      {configs.length > 0 && (
        <div>
          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto rounded-t-xl border border-b-0 border-zinc-800/60 bg-zinc-900/40 p-1.5">
            {configs.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setActiveTab(i)}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200",
                  activeTab === i
                    ? "bg-zinc-800 text-blue-400 shadow-sm"
                    : "text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-300"
                )}
              >
                <Terminal className="h-3 w-3" />
                {c.deviceHostname}
                <span
                  className={cn(
                    "rounded-md px-1.5 py-0.5 text-[9px] font-medium",
                    activeTab === i
                      ? "bg-blue-500/10 text-blue-400"
                      : "bg-zinc-800 text-zinc-600"
                  )}
                >
                  {c.type}
                </span>
              </button>
            ))}
          </div>

          {/* Active config */}
          {configs[activeTab] && (
            <ConfigViewer config={configs[activeTab]} />
          )}
        </div>
      )}

      {configs.length === 0 && !error && (
        <div className="relative overflow-hidden rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 p-12 text-center">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />
          </div>
          <div className="relative">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800/60 text-zinc-500">
              <Sparkles className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-bold text-zinc-100">
              No configs generated yet
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Add devices, then click &quot;Generate All Configs&quot; to create
              Cisco IOS configurations.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function ConfigViewer({ config }: { config: ConfigItem }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(config.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([config.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${config.deviceHostname}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const lines = config.content.split("\n");

  return (
    <div className="relative overflow-hidden rounded-b-xl border border-t-0 border-zinc-800/60 bg-zinc-950">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-zinc-800/60 px-4 py-2.5 bg-zinc-900/40">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Terminal className="h-3.5 w-3.5 text-zinc-600" />
          {config.deviceName} — {config.deviceType.replace(/_/g, " ")} —{" "}
          <span className="font-mono text-zinc-400">{lines.length} lines</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700/60 bg-zinc-800/60 px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-200"
          >
            {copied ? (
              <Check className="h-3 w-3 text-emerald-400" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700/60 bg-zinc-800/60 px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-200"
          >
            <Download className="h-3 w-3" />
            .txt
          </button>
        </div>
      </div>

      {/* Config code */}
      <div className="max-h-[600px] overflow-auto p-4">
        <pre className="text-sm leading-relaxed">
          {lines.map((line, i) => (
            <div key={i} className="group flex hover:bg-zinc-900/40 -mx-4 px-4 rounded">
              <span className="mr-4 inline-block w-8 select-none text-right font-mono text-[10px] text-zinc-700 group-hover:text-zinc-500">
                {i + 1}
              </span>
              <span
                className={cn(
                  "font-mono",
                  line.startsWith("!")
                    ? "text-zinc-600"
                    : line.startsWith(" ")
                      ? "text-zinc-400"
                      : "text-zinc-200"
                )}
              >
                {line || " "}
              </span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}
