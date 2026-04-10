import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

type Ctx = { params: Promise<{ projectId: string; branchId: string }> };

async function getOwnedBranch(projectId: string, branchId: string, userId: string) {
  return db.branch.findFirst({
    where: { id: branchId, projectId, project: { userId } },
  });
}

// GET
export async function GET(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId, branchId } = await params;

  const branch = await db.branch.findFirst({
    where: { id: branchId, projectId, project: { userId: session.user.id } },
    include: {
      departments: {
        include: {
          devices: true,
          subnet: true,
          vlan: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!branch)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(branch);
}

// PUT
const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  location: z.string().max(200).optional().nullable(),
});

export async function PUT(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId, branchId } = await params;

  const existing = await getOwnedBranch(projectId, branchId, session.user.id);
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });

  const branch = await db.branch.update({
    where: { id: branchId },
    data: parsed.data,
  });
  return NextResponse.json(branch);
}

// DELETE
export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId, branchId } = await params;

  const existing = await getOwnedBranch(projectId, branchId, session.user.id);
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.branch.delete({ where: { id: branchId } });
  return NextResponse.json({ ok: true });
}
