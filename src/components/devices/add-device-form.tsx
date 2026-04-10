"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const DEVICE_CATEGORIES = [
  {
    label: "Layer 3",
    devices: [
      { value: "ROUTER", label: "Router" },
      { value: "FIREWALL", label: "Firewall" },
    ],
  },
  {
    label: "Layer 2 — Switches",
    devices: [
      { value: "CORE_SWITCH", label: "Core Switch" },
      { value: "DISTRIBUTION_SWITCH", label: "Distribution Switch" },
      { value: "ACCESS_SWITCH", label: "Access Switch" },
    ],
  },
  {
    label: "Wireless",
    devices: [
      { value: "AUTONOMOUS_AP", label: "Autonomous AP" },
      { value: "LIGHTWEIGHT_AP", label: "Lightweight AP" },
      { value: "WLC", label: "WLC" },
    ],
  },
  {
    label: "Servers",
    devices: [
      { value: "DHCP_SERVER", label: "DHCP Server" },
      { value: "DNS_SERVER", label: "DNS Server" },
      { value: "WEB_SERVER", label: "Web Server" },
      { value: "FILE_SERVER", label: "File Server" },
      { value: "EMAIL_SERVER", label: "Email Server" },
      { value: "NTP_SERVER", label: "NTP Server" },
    ],
  },
  {
    label: "Endpoints",
    devices: [
      { value: "PC", label: "PC" },
      { value: "LAPTOP", label: "Laptop" },
      { value: "IP_PHONE", label: "IP Phone" },
      { value: "PRINTER", label: "Printer" },
      { value: "CCTV", label: "CCTV" },
      { value: "IOT_DEVICE", label: "IoT Device" },
    ],
  },
];

export function AddDeviceForm({
  projectId,
  branchId,
  deptId,
}: {
  projectId: string;
  branchId: string;
  deptId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-md border border-dashed border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
      >
        + Add Device
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedType) return;
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    const res = await fetch(
      `/api/projects/${projectId}/branches/${branchId}/departments/${deptId}/devices`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          type: selectedType,
          notes: fd.get("notes") || undefined,
        }),
      }
    );

    if (res.ok) {
      setOpen(false);
      setSelectedType(null);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-2 rounded-lg border border-zinc-800 bg-zinc-950 p-4"
    >
      {/* Device type picker grid */}
      <p className="mb-2 text-[10px] uppercase tracking-wider text-zinc-500">
        Select device type
      </p>
      <div className="mb-4 space-y-3">
        {DEVICE_CATEGORIES.map((cat) => (
          <div key={cat.label}>
            <p className="mb-1 text-[10px] text-zinc-600">{cat.label}</p>
            <div className="flex flex-wrap gap-1.5">
              {cat.devices.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setSelectedType(d.value)}
                  className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                    selectedType === d.value
                      ? "border-blue-500 bg-blue-500/10 text-blue-400"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedType && (
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-zinc-500">
              Display name *
            </label>
            <input
              name="name"
              required
              placeholder="e.g. Main Router"
              className="h-9 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-zinc-500">
              Notes
            </label>
            <input
              name="notes"
              placeholder="Optional"
              className="h-9 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="h-9 rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Add Device"
            )}
          </button>
        </div>
      )}

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setSelectedType(null);
          }}
          className="text-xs text-zinc-500 hover:text-zinc-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
