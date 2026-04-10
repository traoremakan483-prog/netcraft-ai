import { auth } from "@/lib/auth";
import { FolderKanban, Router, Network, AlertTriangle } from "lucide-react";

const STATS = [
  { label: "Projects", value: "0", icon: FolderKanban },
  { label: "Devices", value: "0", icon: Router },
  { label: "Subnets", value: "0", icon: Network },
  { label: "Issues", value: "0", icon: AlertTriangle },
];

export default async function DashboardPage() {
  const session = await auth();
  const name = session?.user?.name?.split(" ")[0] ?? "engineer";

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-wider text-zinc-500">
          Dashboard
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50">
          Welcome back, {name}
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Tu décris ton réseau. NetCraft AI le construit.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-lg border border-zinc-800 bg-zinc-900 p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                {label}
              </p>
              <Icon className="h-4 w-4 text-zinc-600" />
            </div>
            <p className="mt-2 font-mono text-3xl font-semibold text-zinc-50">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-900/40 p-10 text-center">
        <h2 className="text-lg font-semibold text-zinc-100">No projects yet</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Create your first project to start planning subnets, VLANs and
          configs.
        </p>
        <a
          href="/projects/new"
          className="mt-4 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          New Project
        </a>
      </div>
    </div>
  );
}
