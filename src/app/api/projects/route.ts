import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  type: z.enum(["LAN", "WAN", "LAN_WAN"]).default("LAN"),
  baseNetwork: z
    .string()
    .regex(
      /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2}$/,
      "Invalid CIDR notation (e.g. 192.168.0.0/16)"
    )
    .optional(),
});

// GET /api/projects — list all projects for authenticated user
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await db.project.findMany({
    where: { userId: session.user.id },
    include: {
      _count: {
        select: { branches: true, subnets: true, vlans: true },
      },
      branches: {
        include: {
          _count: { select: { departments: true } },
          departments: {
            include: { _count: { select: { devices: true } } },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Compute device count per project
  const result = projects.map((p) => {
    const deviceCount = p.branches.reduce(
      (acc, b) =>
        acc + b.departments.reduce((a, d) => a + d._count.devices, 0),
      0
    );
    const deptCount = p.branches.reduce(
      (acc, b) => acc + b._count.departments,
      0
    );
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      type: p.type,
      baseNetwork: p.baseNetwork,
      branchCount: p._count.branches,
      departmentCount: deptCount,
      deviceCount,
      subnetCount: p._count.subnets,
      vlanCount: p._count.vlans,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  });

  return NextResponse.json(result);
}

// POST /api/projects — create a new project
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const project = await db.project.create({
    data: {
      ...parsed.data,
      userId: session.user.id,
    },
  });

  return NextResponse.json(project, { status: 201 });
}
