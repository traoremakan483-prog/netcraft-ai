import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { validateProject } from "@/lib/engines/validate";

type Ctx = { params: Promise<{ projectId: string }> };

// GET /api/projects/[projectId]/validate
export async function GET(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;

  const project = await db.project.findFirst({
    where: { id: projectId, userId: session.user.id },
    include: {
      vlans: { include: { departments: { select: { id: true } } } },
      branches: {
        include: {
          departments: {
            include: {
              vlan: { select: { number: true, name: true } },
              subnet: {
                select: {
                  networkAddress: true,
                  broadcastAddress: true,
                  gatewayAddress: true,
                  cidr: true,
                  usableHosts: true,
                },
              },
              devices: {
                select: {
                  name: true,
                  hostname: true,
                  type: true,
                  ipAddress: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!project)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const configs = await db.config.findMany({
    where: { device: { department: { branch: { projectId } } } },
    include: { device: { select: { hostname: true, name: true } } },
  });

  const items = validateProject({
    baseNetwork: project.baseNetwork,
    branches: project.branches,
    vlans: project.vlans,
    configs,
  });

  const errors = items.filter((i) => i.severity === "error").length;
  const warnings = items.filter((i) => i.severity === "warning").length;
  const recommendations = items.filter((i) => i.severity === "recommendation").length;

  return NextResponse.json({ items, summary: { errors, warnings, recommendations } });
}
