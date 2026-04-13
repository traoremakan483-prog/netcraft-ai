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
  MapPin,
} from "lucide-react";
import { DeleteButton } from "@/components/ui/delete-button";
import { AddBranchForm } from "@/components/branches/add-branch-form";
import { AddDepartmentForm } from "@/components/departments/add-department-form";
import { AddDeviceForm } from "@/components/devices/add-device-form";

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
            include: {
              devices: { orderBy: { createdAt: "asc" } },
              subnet: true,
              vlan: true,
              _count: { select: { devices: true } },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { subnets: true, vlans: true } },
    },
  });

  if (!project) notFound();

  const isLan = project.type === "LAN";

  // For LAN projects: ensure the auto-branch exists (handles pre-existing projects)
  let lanBranch = isLan ? project.branches[0] ?? null : null;
  if (isLan && !lanBranch) {
    // Use upsert-like pattern: try to find first, create only if missing
    const existing = await db.branch.findFirst({ where: { projectId: project.id } });
    if (!existing) {
      const created = await db.branch.create({
        data: { name: project.name, location: "Main site", projectId: project.id },
        include: {
          _count: { select: { departments: true } },
          departments: {
            include: {
              devices: { orderBy: { createdAt: "asc" } },
              subnet: true,
              vlan: true,
              _count: { select: { devices: true } },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      });
      lanBranch = created;
    } else {
      // Refetch with full includes
      lanBranch = await db.branch.findFirst({
        where: { id: existing.id },
        include: {
          _count: { select: { departments: true } },
          departments: {
            include: {
              devices: { orderBy: { createdAt: "asc" } },
              subnet: true,
              vlan: true,
              _count: { select: { devices: true } },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      });
    }
  }

  const totalDepts = project.branches.reduce(
    (a, b) => a + b._count.departments,
    0
  );
  const totalDevices = project.branches.reduce(
    (a, b) => a + b.departments.reduce((x, d) => x + d._count.devices, 0),
    0
  );

  // Build stats based on project type
  const stats = isLan
    ? [
        {
          label: "Departments",
          value: totalDepts,
          icon: Building2,
          color: "text-emerald-400",
          bg: "bg-emerald-500/10",
        },
        {
          label: "Devices",
          value: totalDevices,
          icon: Router,
          color: "text-violet-400",
          bg: "bg-violet-500/10",
        },
        {
          label: "Subnets",
          value: project._count.subnets,
          icon: Network,
          color: "text-cyan-400",
          bg: "bg-cyan-500/10",
        },
        {
          label: "VLANs",
          value: project._count.vlans,
          icon: Tag,
          color: "text-amber-400",
          bg: "bg-amber-500/10",
        },
      ]
    : [
        {
          label: "Branches",
          value: project.branches.length,
          icon: GitBranch,
          color: "text-blue-400",
          bg: "bg-blue-500/10",
        },
        {
          label: "Departments",
          value: totalDepts,
          icon: Building2,
          color: "text-emerald-400",
          bg: "bg-emerald-500/10",
        },
        {
          label: "Devices",
          value: totalDevices,
          icon: Router,
          color: "text-violet-400",
          bg: "bg-violet-500/10",
        },
        {
          label: "Subnets",
          value: project._count.subnets,
          icon: Network,
          color: "text-cyan-400",
          bg: "bg-cyan-500/10",
        },
        {
          label: "VLANs",
          value: project._count.vlans,
          icon: Tag,
          color: "text-amber-400",
          bg: "bg-amber-500/10",
        },
      ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between">
          <div>
            <Link
              href="/projects"
              className="group inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-300"
            >
              <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
              All projects
            </Link>
            <div className="mt-3 flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
                {project.name}
              </h1>
              <span className="rounded-full border border-zinc-700/60 bg-zinc-800/60 px-2.5 py-0.5 font-mono text-[10px] font-medium text-zinc-400">
                {project.type}
              </span>
            </div>
          </div>
          <DeleteButton
            endpoint={`/api/projects/${project.id}`}
            redirectTo="/projects"
            label="Delete project"
            confirmMessage="Delete this project and all its data?"
          />
        </div>
        {project.description && (
          <p className="mt-2 text-sm text-zinc-400">{project.description}</p>
        )}
        {project.baseNetwork && (
          <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-3 py-1 font-mono text-sm text-blue-400">
            <Network className="h-3.5 w-3.5" />
            {project.baseNetwork}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className={`grid gap-3 sm:grid-cols-2 ${isLan ? "lg:grid-cols-4" : "lg:grid-cols-5"}`}>
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="group rounded-xl border border-zinc-800/60 bg-zinc-900/40 px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-700/60 hover:bg-zinc-900/60"
          >
            <div className="flex items-center gap-2">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-md ${bg}`}
              >
                <Icon className={`h-3 w-3 ${color}`} />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                {label}
              </p>
            </div>
            <p className="mt-2 font-mono text-2xl font-bold text-zinc-50">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* === LAN MODE: Show departments + devices directly === */}
      {isLan && lanBranch && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">
            Departments
          </h2>

          {lanBranch.departments.length > 0 ? (
            <div className="space-y-4">
              {lanBranch.departments.map((dept) => (
                <div
                  key={dept.id}
                  className="overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-900/40"
                >
                  {/* Dept header */}
                  <div className="flex items-center justify-between border-b border-zinc-800/40 px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                        <Building2 className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-zinc-100">
                          {dept.name}
                        </h3>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                          <span className="rounded-md border border-zinc-700/60 bg-zinc-800/60 px-1.5 py-0.5 font-mono">
                            {dept.type}
                          </span>
                          <span>{dept.estimatedHosts} hosts</span>
                          {dept.vlan && (
                            <span className="flex items-center gap-0.5 text-blue-400">
                              <Tag className="h-2.5 w-2.5" />
                              VLAN {dept.vlan.number}
                            </span>
                          )}
                          {dept.subnet && (
                            <span className="flex items-center gap-0.5 text-emerald-400">
                              <Network className="h-2.5 w-2.5" />
                              {dept.subnet.networkAddress}/{dept.subnet.cidr}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="rounded-full bg-zinc-800/60 px-2.5 py-0.5 font-mono text-[10px] font-medium text-zinc-400">
                      {dept._count.devices} devices
                    </span>
                  </div>

                  {/* Devices */}
                  <div className="px-5 py-3">
                    {dept.devices.length > 0 ? (
                      <div className="space-y-1.5">
                        {dept.devices.map((device) => (
                          <div
                            key={device.id}
                            className="flex items-center justify-between rounded-lg bg-zinc-950/60 px-3 py-2.5 transition-colors hover:bg-zinc-950"
                          >
                            <div className="flex items-center gap-3">
                              <Router className="h-3.5 w-3.5 text-zinc-500" />
                              <div>
                                <p className="text-sm font-medium text-zinc-200">
                                  {device.name}
                                </p>
                                <p className="text-[10px] text-zinc-500">
                                  {device.type.replace(/_/g, " ")}
                                  {device.hostname && (
                                    <span className="ml-2 font-mono text-blue-400">
                                      {device.hostname}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            {device.ipAddress && (
                              <span className="font-mono text-xs text-zinc-400">
                                {device.ipAddress}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="py-2 text-center text-xs text-zinc-600">
                        No devices yet
                      </p>
                    )}

                    <div className="mt-3">
                      <AddDeviceForm
                        projectId={projectId}
                        branchId={lanBranch.id}
                        deptId={dept.id}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-10 text-center">
              <p className="text-sm text-zinc-400">
                No departments yet. Add your first department (e.g. &quot;IT&quot;,
                &quot;Sales&quot;, &quot;Server Room&quot;).
              </p>
            </div>
          )}

          <AddDepartmentForm projectId={projectId} branchId={lanBranch.id} />
        </div>
      )}

      {/* === WAN / LAN_WAN MODE: Show branches === */}
      {!isLan && (
        <div>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-zinc-400">
            Branches
          </h2>

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
                    className="group relative overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-700/60 hover:bg-zinc-800/40 hover:shadow-lg hover:shadow-black/20"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                          <GitBranch className="h-4 w-4 text-blue-400" />
                        </div>
                        <h3 className="font-bold text-zinc-100 transition-colors group-hover:text-blue-400">
                          {branch.name}
                        </h3>
                      </div>
                      {branch.location && (
                        <p className="mt-2 flex items-center gap-1 text-xs text-zinc-500">
                          <MapPin className="h-3 w-3" />
                          {branch.location}
                        </p>
                      )}
                      <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="h-3 w-3" />
                          {branch._count.departments} depts
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Router className="h-3 w-3" />
                          {devices} devices
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-10 text-center">
              <p className="text-sm text-zinc-400">
                No branches yet. Add your first branch (e.g. &quot;HQ&quot;,
                &quot;Branch Office&quot;).
              </p>
            </div>
          )}

          <div className="mt-4">
            <AddBranchForm projectId={project.id} />
          </div>
        </div>
      )}
    </div>
  );
}
