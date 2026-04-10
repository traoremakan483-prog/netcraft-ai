import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import {
  ArrowLeft,
  GitBranch,
  Building2,
  Router,
  Network,
  Tag,
  ShieldCheck,
  Plus,
  Calculator,
  Cog,
  ClipboardCheck,
} from "lucide-react";

type Props = { params: Promise<{ projectId: string }> };

export default async function ProjectOverviewPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const { projectId } = await params;

  const project = await db.project.findFirst({
    where: { id: projectId, userId: session.user.id },
    include: {
      branches: {
        include: {
          _count: { select: { departments: true } },
          departments: {
            include: { _count: { select: { devices: true } } },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { subnets: true, vlans: true } },
    },
  });

  if (!project) notFound();

  const totalDepts = project.branches.reduce(
    (a, b) => a + b._count.departments,
    0
  );
  const totalDevices = project.branches.reduce(
    (a, b) => a + b.departments.reduce((x, d) => x + d._count.devices, 0),
    0
  );

  const stats = [
    { label: "Branches", value: project.branches.length, icon: GitBranch },
    { label: "Departments", value: totalDepts, icon: Building2 },
    { label: "Devices", value: totalDevices, icon: Router },
    { label: "Subnets", value: project._count.subnets, icon: Network },
    { label: "VLANs", value: project._count.vlans, icon: Tag },
  ];

  const actions = [
    {
      label: "Add Branch",
      href: `/projects/${project.id}`,
      icon: Plus,
      soon: false,
    },
    {
      label: "VLSM",
      href: `/projects/${project.id}/subnets`,
      icon: Calculator,
    },
    {
      label: "VLANs",
      href: `/projects/${project.id}/vlans`,
      icon: Tag,
    },
    {
      label: "Configs",
      href: `/projects/${project.id}/configs`,
      icon: Cog,
    },
    {
      label: "Validate",
      href: `/projects/${project.id}/validation`,
      icon: ClipboardCheck,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300"
        >
          <ArrowLeft className="h-3 w-3" />
          All projects
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
            {project.name}
          </h1>
          <span className="rounded-full border border-zinc-700 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
            {project.type}
          </span>
        </div>
        {project.description && (
          <p className="mt-1 text-sm text-zinc-400">{project.description}</p>
        )}
        {project.baseNetwork && (
          <p className="mt-1 font-mono text-sm text-blue-400">
            Base: {project.baseNetwork}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <Icon className="h-3.5 w-3.5 text-zinc-500" />
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                {label}
              </p>
            </div>
            <p className="mt-1 font-mono text-2xl font-semibold text-zinc-50">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        {actions.map(({ label, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="inline-flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100"
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Link>
        ))}
      </div>

      {/* Branches */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-100">Branches</h2>
          <AddBranchButton projectId={project.id} />
        </div>

        {project.branches.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {project.branches.map((branch) => {
              const devices = branch.departments.reduce(
                (a, d) => a + d._count.devices,
                0
              );
              return (
                <Link
                  key={branch.id}
                  href={`/projects/${project.id}/branches/${branch.id}`}
                  className="group rounded-lg border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-zinc-700 hover:bg-zinc-800/60"
                >
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-blue-500" />
                    <h3 className="font-semibold text-zinc-100">
                      {branch.name}
                    </h3>
                  </div>
                  {branch.location && (
                    <p className="mt-1 text-xs text-zinc-500">
                      {branch.location}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {branch._count.departments} depts
                    </span>
                    <span className="flex items-center gap-1">
                      <Router className="h-3 w-3" />
                      {devices} devices
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-900/40 p-8 text-center">
            <p className="text-sm text-zinc-400">
              No branches yet. Add your first branch (e.g. &quot;HQ&quot;,
              &quot;Branch Office&quot;).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Inline client component for Add Branch
function AddBranchButton({ projectId }: { projectId: string }) {
  return (
    <Link
      href={`/projects/${projectId}/branches/new`}
      className="inline-flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100"
    >
      <Plus className="h-3 w-3" />
      Add Branch
    </Link>
  );
}
