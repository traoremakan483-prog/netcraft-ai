import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import {
  FolderKanban,
  Plus,
  GitBranch,
  Router,
  Network,
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-zinc-500">
            Projects
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50">
            All projects
          </h1>
        </div>
        <Link
          href="/projects/new"
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Link>
      </div>

      {projects.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => {
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
                className="group rounded-lg border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-zinc-700 hover:bg-zinc-800/60"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FolderKanban className="h-5 w-5 text-blue-500" />
                    <h2 className="font-semibold text-zinc-100">{p.name}</h2>
                  </div>
                  <span className="rounded-full border border-zinc-700 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                    {p.type}
                  </span>
                </div>
                {p.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
                    {p.description}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <GitBranch className="h-3 w-3" />
                    {p._count.branches}
                  </span>
                  <span className="flex items-center gap-1">
                    <Router className="h-3 w-3" />
                    {deviceCount}
                  </span>
                  <span className="flex items-center gap-1">
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
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-900/40 p-10 text-center">
          <FolderKanban className="mx-auto h-10 w-10 text-zinc-700" />
          <h2 className="mt-3 text-lg font-semibold text-zinc-100">
            No projects yet
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Create your first project to get started.
          </p>
          <Link
            href="/projects/new"
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Link>
        </div>
      )}
    </div>
  );
}
