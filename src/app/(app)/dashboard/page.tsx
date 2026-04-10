import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import {
  FolderKanban,
  Router,
  Network,
  AlertTriangle,
  Plus,
  ArrowRight,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const name = session?.user?.name?.split(" ")[0] ?? "engineer";

  // Fetch real stats
  const [projectCount, deviceCount, subnetCount, projects] = userId
    ? await Promise.all([
        db.project.count({ where: { userId } }),
        db.device.count({
          where: { department: { branch: { project: { userId } } } },
        }),
        db.subnet.count({ where: { project: { userId } } }),
        db.project.findMany({
          where: { userId },
          include: {
            _count: { select: { branches: true, subnets: true } },
          },
          orderBy: { updatedAt: "desc" },
          take: 5,
        }),
      ])
    : [0, 0, 0, []];

  const stats = [
    { label: "Projects", value: projectCount, icon: FolderKanban },
    { label: "Devices", value: deviceCount, icon: Router },
    { label: "Subnets", value: subnetCount, icon: Network },
    { label: "Issues", value: 0, icon: AlertTriangle },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
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
        <Link
          href="/projects/new"
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
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

      {/* Recent projects or empty state */}
      {projects.length > 0 ? (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-zinc-100">
            Recent projects
          </h2>
          <div className="divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-900">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-zinc-800/60"
              >
                <div className="flex items-center gap-3">
                  <FolderKanban className="h-4 w-4 text-zinc-500" />
                  <div>
                    <p className="text-sm font-medium text-zinc-100">
                      {p.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {p._count.branches} branches · {p._count.subnets} subnets
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full border border-zinc-700 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                    {p.type}
                  </span>
                  <ArrowRight className="h-4 w-4 text-zinc-600" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-900/40 p-10 text-center">
          <h2 className="text-lg font-semibold text-zinc-100">
            No projects yet
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Create your first project to start planning subnets, VLANs and
            configs.
          </p>
          <Link
            href="/projects/new"
            className="mt-4 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            New Project
          </Link>
        </div>
      )}
    </div>
  );
}
