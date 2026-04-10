import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateVlsm } from "@/lib/engines/vlsm";

type Ctx = { params: Promise<{ projectId: string }> };

// POST /api/projects/[projectId]/vlsm — calculate VLSM and persist subnets
export async function POST(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;

  const project = await db.project.findFirst({
    where: { id: projectId, userId: session.user.id },
    include: {
      branches: {
        include: {
          departments: {
            select: { id: true, name: true, estimatedHosts: true },
          },
        },
      },
    },
  });

  if (!project)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!project.baseNetwork) {
    return NextResponse.json(
      { error: "No base network defined. Set it in project settings first." },
      { status: 400 }
    );
  }

  // Gather all departments across all branches
  const departments = project.branches.flatMap((b) =>
    b.departments.map((d) => ({
      id: d.id,
      name: d.name,
      estimatedHosts: d.estimatedHosts,
    }))
  );

  if (departments.length === 0) {
    return NextResponse.json(
      { error: "No departments found. Add branches and departments first." },
      { status: 400 }
    );
  }

  const result = calculateVlsm({
    baseNetwork: project.baseNetwork,
    departments,
  });

  if (result.errors.length > 0 && result.subnets.length === 0) {
    return NextResponse.json(
      { error: result.errors.join("; "), result },
      { status: 400 }
    );
  }

  // Delete existing subnets for this project, then insert new ones
  await db.subnet.deleteMany({ where: { projectId } });

  if (result.subnets.length > 0) {
    await db.subnet.createMany({
      data: result.subnets.map((s) => ({
        networkAddress: s.networkAddress,
        broadcastAddress: s.broadcastAddress,
        subnetMask: s.subnetMask,
        cidr: s.cidr,
        firstHost: s.firstHost,
        lastHost: s.lastHost,
        wildcardMask: s.wildcardMask,
        totalHosts: s.totalHosts,
        usableHosts: s.usableHosts,
        gatewayAddress: s.gatewayAddress,
        departmentId: s.departmentId,
        projectId,
      })),
    });
  }

  return NextResponse.json(result);
}
