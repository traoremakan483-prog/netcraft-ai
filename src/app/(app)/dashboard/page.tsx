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
  Zap,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const name = session?.user?.name?.split(" ")[0] ?? "engineer";

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
    {
      label: "Projects",
      value: projectCount,
      icon: FolderKanban,
      gradient: "from-blue-500/20 to-blue-600/5",
      iconColor: "text-blue-400",
      borderColor: "border-blue-500/20",
    },
    {
      label: "Devices",
      value: deviceCount,
      icon: Router,
      gradient: "from-emerald-500/20 to-emerald-600/5",
      iconColor: "text-emerald-400",
      borderColor: "border-emerald-500/20",
    },
    {
      label: "Subnets",
      value: subnetCount,
      icon: Network,
      gradient: "from-violet-500/20 to-violet-600/5",
      iconColor: "text-violet-400",
      borderColor: "border-violet-500/20",
    },
    {
      label: "Issues",
      value: 0,
      icon: AlertTriangle,
      gradient: "from-amber-500/20 to-amber-600/5",
      iconColor: "text-amber-400",
      borderColor: "border-amber-500/20",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-400" />
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400/80">
              Dashboard
            </p>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-50">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              {name}
            </span>
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500">
            Tu décris ton réseau. NetCraft AI le construit.
          </p>
        </div>
        <Link
          href="/projects/new"
          className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:shadow-blue-500/40 hover:brightness-110"
        >
          <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
          New Project
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, gradient, iconColor, borderColor }, i) => (
          <div
            key={label}
            className={`group relative overflow-hidden rounded-xl border ${borderColor} bg-gradient-to-br ${gradient} p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="absolute inset-0 bg-zinc-900/80" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                  {label}
                </p>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800/80 ${iconColor}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 font-mono text-4xl font-bold text-zinc-50">
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent projects */}
      {projects.length > 0 ? (
        <div className="animate-slide-up [animation-delay:200ms]">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-zinc-400">
            Recent projects
          </h2>
          <div className="overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-sm">
            {projects.map((p, i) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className={`group flex items-center justify-between px-5 py-4 transition-all duration-200 hover:bg-zinc-800/40 ${
                  i !== projects.length - 1 ? "border-b border-zinc-800/40" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800/80 text-zinc-500 transition-colors group-hover:bg-blue-500/10 group-hover:text-blue-400">
                    <FolderKanban className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-100 group-hover:text-blue-400 transition-colors">
                      {p.name}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {p._count.branches} branches · {p._count.subnets} subnets
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full border border-zinc-700/60 bg-zinc-800/60 px-2.5 py-0.5 font-mono text-[10px] font-medium text-zinc-400">
                    {p.type}
                  </span>
                  <ArrowRight className="h-4 w-4 text-zinc-600 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-blue-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="animate-slide-up [animation-delay:200ms] relative overflow-hidden rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 p-12 text-center">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />
          </div>
          <div className="relative">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800/60 text-zinc-500">
              <FolderKanban className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-bold text-zinc-100">No projects yet</h2>
            <p className="mt-2 text-sm text-zinc-500">
              Create your first project to start planning subnets, VLANs and
              configs.
            </p>
            <Link
              href="/projects/new"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/40 hover:brightness-110"
            >
              <Plus className="h-4 w-4" />
              New Project
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
