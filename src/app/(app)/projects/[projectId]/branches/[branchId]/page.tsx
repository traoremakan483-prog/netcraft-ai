import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Router,
  MapPin,
  Tag,
  Network,
} from "lucide-react";
import { AddDepartmentForm } from "@/components/departments/add-department-form";
import { AddDeviceForm } from "@/components/devices/add-device-form";

type Props = {
  params: Promise<{ projectId: string; branchId: string }>;
};

export default async function BranchDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const { projectId, branchId } = await params;

  const branch = await db.branch.findFirst({
    where: {
      id: branchId,
      projectId,
      project: { userId: session.user.id },
    },
    include: {
      project: { select: { name: true } },
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

  if (!branch) notFound();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href={`/projects/${projectId}`}
          className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300"
        >
          <ArrowLeft className="h-3 w-3" />
          {branch.project.name}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50">
          {branch.name}
        </h1>
        {branch.location && (
          <p className="mt-1 flex items-center gap-1 text-sm text-zinc-400">
            <MapPin className="h-3.5 w-3.5" />
            {branch.location}
          </p>
        )}
        <div className="mt-2 flex gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {branch.departments.length} departments
          </span>
          <span className="flex items-center gap-1">
            <Router className="h-3 w-3" />
            {branch.departments.reduce((a, d) => a + d._count.devices, 0)}{" "}
            devices
          </span>
        </div>
      </div>

      {/* Departments */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-100">Departments</h2>

        {branch.departments.map((dept) => (
          <div
            key={dept.id}
            className="rounded-lg border border-zinc-800 bg-zinc-900"
          >
            {/* Dept header */}
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-zinc-500" />
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">
                    {dept.name}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                    <span className="rounded border border-zinc-700 px-1.5 py-0.5 font-mono">
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
                      <span className="flex items-center gap-0.5 text-green-400">
                        <Network className="h-2.5 w-2.5" />
                        {dept.subnet.networkAddress}/{dept.subnet.cidr}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                {dept._count.devices} devices
              </span>
            </div>

            {/* Devices */}
            <div className="px-4 py-3">
              {dept.devices.length > 0 ? (
                <div className="space-y-1.5">
                  {dept.devices.map((device) => (
                    <div
                      key={device.id}
                      className="flex items-center justify-between rounded-md bg-zinc-950 px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <Router className="h-3.5 w-3.5 text-zinc-500" />
                        <div>
                          <p className="text-sm text-zinc-200">
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
                  branchId={branchId}
                  deptId={dept.id}
                />
              </div>
            </div>
          </div>
        ))}

        <AddDepartmentForm projectId={projectId} branchId={branchId} />
      </div>
    </div>
  );
}
