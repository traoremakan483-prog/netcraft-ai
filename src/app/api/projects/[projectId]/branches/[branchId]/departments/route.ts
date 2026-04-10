import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

type Ctx = { params: Promise<{ projectId: string; branchId: string }> };

const DEPT_TYPES = [
  "IT", "SALES", "HR", "MANAGEMENT", "SERVER_ROOM",
  "RECEPTION", "OPEN_SPACE", "MEETING_ROOM", "SECURITY", "CUSTOM",
] as const;

const createSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(DEPT_TYPES).default("CUSTOM"),
  estimatedHosts: z.number().int().min(1).max(10000).default(10),
});

// GET
export async function GET(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId, branchId } = await params;

  const branch = await db.branch.findFirst({
    where: { id: branchId, projectId, project: { userId: session.user.id } },
  });
  if (!branch)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const departments = await db.department.findMany({
    where: { branchId },
    include: {
      _count: { select: { devices: true } },
      subnet: true,
      vlan: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(departments);
}

// POST
export async function POST(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId, branchId } = await params;

  const branch = await db.branch.findFirst({
    where: { id: branchId, projectId, project: { userId: session.user.id } },
  });
  if (!branch)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );

  const department = await db.department.create({
    data: { ...parsed.data, branchId },
  });

  return NextResponse.json(department, { status: 201 });
}
