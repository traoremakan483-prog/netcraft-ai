import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

type Ctx = { params: Promise<{ projectId: string }> };

async function getOwnedProject(projectId: string, userId: string) {
  return db.project.findFirst({
    where: { id: projectId, userId },
  });
}

// GET /api/projects/[projectId]
export async function GET(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { projectId } = await params;

  const project = await db.project.findFirst({
    where: { id: projectId, userId: session.user.id },
    include: {
      branches: {
        include: {
          departments: {
            include: {
              devices: true,
              subnet: true,
              vlan: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      subnets: true,
      vlans: true,
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(project);
}

// PUT /api/projects/[projectId]
const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  type: z.enum(["LAN", "WAN", "LAN_WAN"]).optional(),
  baseNetwork: z
    .string()
    .regex(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2}$/)
    .optional()
    .nullable(),
});

export async function PUT(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { projectId } = await params;

  const existing = await getOwnedProject(projectId, session.user.id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const project = await db.project.update({
    where: { id: projectId },
    data: parsed.data,
  });

  return NextResponse.json(project);
}

// DELETE /api/projects/[projectId]
export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { projectId } = await params;

  const existing = await getOwnedProject(projectId, session.user.id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.project.delete({ where: { id: projectId } });

  return NextResponse.json({ ok: true });
}
