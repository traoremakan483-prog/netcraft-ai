import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

type Ctx = {
  params: Promise<{ projectId: string; branchId: string; deptId: string }>;
};

const DEPT_TYPES = [
  "IT", "SALES", "HR", "MANAGEMENT", "SERVER_ROOM",
  "RECEPTION", "OPEN_SPACE", "MEETING_ROOM", "SECURITY", "CUSTOM",
] as const;

async function getOwnedDept(projectId: string, branchId: string, deptId: string, userId: string) {
  return db.department.findFirst({
    where: {
      id: deptId,
      branchId,
      branch: { projectId, project: { userId } },
    },
  });
}

// GET
export async function GET(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId, branchId, deptId } = await params;

  const dept = await db.department.findFirst({
    where: {
      id: deptId,
      branchId,
      branch: { projectId, project: { userId: session.user.id } },
    },
    include: { devices: true, subnet: true, vlan: true },
  });
  if (!dept)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(dept);
}

// PUT
const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(DEPT_TYPES).optional(),
  estimatedHosts: z.number().int().min(1).max(10000).optional(),
});

export async function PUT(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId, branchId, deptId } = await params;

  const existing = await getOwnedDept(projectId, branchId, deptId, session.user.id);
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });

  const dept = await db.department.update({
    where: { id: deptId },
    data: parsed.data,
  });
  return NextResponse.json(dept);
}

// DELETE
export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId, branchId, deptId } = await params;

  const existing = await getOwnedDept(projectId, branchId, deptId, session.user.id);
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.department.delete({ where: { id: deptId } });
  return NextResponse.json({ ok: true });
}
