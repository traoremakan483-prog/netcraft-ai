import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import {
  FolderKanban,
  Plus,
  GitBranch,
  Router,
  Network,
  ArrowUpRight,
} from "lucide-react";

export default async function ProjectsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const projects = userId
    ? await db.project.findMany({
        where: { userId },
        include: {
          _count: { select: { branches: true, subnets: true, vlans: true } },
          branches: {
            include: {
              departments: {
                include: { _count: { select: { devices: true } } },
              },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      })
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400/80">
            Projects
          </p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-zinc-50">
            All projects
          </h1>
        </div>
        <Link
          href="/projects/new"
          className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:shadow-blue-500/40 hover:brightness-110"
        >
          <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
          New Project
        </Link>
      </div>

      {projects.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => {
            const deviceCount = p.branches.reduce(
              (acc, b) =>
                acc +
                b.departments.reduce((a, d) => a + d._count.devices, 0),
              0
            );
            return (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="group relative overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700/60 hover:bg-zinc-800/40 hover:shadow-xl hover:shadow-black/20"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 transition-colors group-hover:bg-blue-500/20">
                        <FolderKanban className="h-4 w-4 text-blue-400" />
                      </div>
                      <h2 className="font-bold text-zinc-100 transition-colors group-hover:text-blue-400">
                        {p.name}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-zinc-700/60 bg-zinc-800/60 px-2.5 py-0.5 font-mono text-[10px] font-medium text-zinc-400">
                        {p.type}
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-zinc-700 transition-all duration-200 group-hover:text-blue-400 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </div>
                  </div>
                  {p.description && (
                    <p className="mt-3 line-clamp-2 text-sm text-zinc-500">
                      {p.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500">
                    <span className="flex items-center gap-1.5">
                      <GitBranch className="h-3 w-3" />
                      {p._count.branches}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Router className="h-3 w-3" />
                      {deviceCount}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Network className="h-3 w-3" />
                      {p._count.subnets}
                    </span>
                  </div>
                  <p className="mt-3 text-[10px] text-zinc-600">
                    Updated{" "}
                    {new Date(p.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 p-12 text-center">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />
          </div>
          <div className="relative">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800/60 text-zinc-500">
              <FolderKanban className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-bold text-zinc-100">No projects yet</h2>
            <p className="mt-2 text-sm text-zinc-500">
              Create your first project to get started.
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
