import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { VlsmPanel } from "@/components/vlsm/vlsm-panel";

type Props = { params: Promise<{ projectId: string }> };

export default async function SubnetsPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) notFound();
  const { projectId } = await params;

  const project = await db.project.findFirst({
    where: { id: projectId, userId: session.user.id },
    include: {
      subnets: {
        include: { department: { select: { name: true, estimatedHosts: true } } },
        orderBy: { networkAddress: "asc" },
      },
    },
  });
  if (!project) notFound();

  // Compute summary
  const totalSpace = project.baseNetwork
    ? 1 << (32 - parseInt(project.baseNetwork.split("/")[1], 10))
    : 0;
  const usedSpace = project.subnets.reduce((a, s) => a + s.totalHosts, 0);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/projects/${projectId}`}
          className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300"
        >
          <ArrowLeft className="h-3 w-3" />
          {project.name}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50">
          Subnets — VLSM
        </h1>
        {project.baseNetwork && (
          <p className="mt-1 font-mono text-sm text-blue-400">
            Base: {project.baseNetwork}
          </p>
        )}
      </div>

      <VlsmPanel
        projectId={projectId}
        hasBaseNetwork={!!project.baseNetwork}
        subnets={project.subnets.map((s) => ({
          id: s.id,
          departmentName: s.department.name,
          networkAddress: s.networkAddress,
          broadcastAddress: s.broadcastAddress,
          subnetMask: s.subnetMask,
          cidr: s.cidr,
          firstHost: s.firstHost,
          lastHost: s.lastHost,
          wildcardMask: s.wildcardMask,
          gatewayAddress: s.gatewayAddress,
          totalHosts: s.totalHosts,
          usableHosts: s.usableHosts,
          requestedHosts: s.department.estimatedHosts,
          utilization:
            s.usableHosts > 0
              ? Math.round((s.department.estimatedHosts / s.usableHosts) * 100)
              : 0,
        }))}
        totalSpace={totalSpace}
        usedSpace={usedSpace}
      />
    </div>
  );
}
