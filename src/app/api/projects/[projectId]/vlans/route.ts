import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { suggestVlans } from "@/lib/engines/vlan";

type Ctx = { params: Promise<{ projectId: string }> };

// GET — list existing VLANs
export async function GET(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId } = await params;

  const project = await db.project.findFirst({
    where: { id: projectId, userId: session.user.id },
  });
  if (!project)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const vlans = await db.vlan.findMany({
    where: { projectId },
    include: { departments: { select: { id: true, name: true } } },
    orderBy: { number: "asc" },
  });

  return NextResponse.json(vlans);
}

// POST — auto-suggest VLANs from departments, persist, and link
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
          departments: { select: { id: true, name: true, type: true } },
        },
      },
    },
  });
  if (!project)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const departments = project.branches.flatMap((b) => b.departments);
  if (departments.length === 0)
    return NextResponse.json(
      { error: "No departments found" },
      { status: 400 }
    );

  const suggestions = suggestVlans(departments);

  // Delete old VLANs and unlink departments
  await db.department.updateMany({
    where: { branch: { projectId } },
    data: { vlanId: null },
  });
  await db.vlan.deleteMany({ where: { projectId } });

  // Create VLANs and link departments
  for (const s of suggestions) {
    const vlan = await db.vlan.create({
      data: {
        number: s.number,
        name: s.name,
        description: s.description,
        projectId,
      },
    });

    if (s.departmentIds.length > 0) {
      await db.department.updateMany({
        where: { id: { in: s.departmentIds } },
        data: { vlanId: vlan.id },
      });
    }
  }

  const vlans = await db.vlan.findMany({
    where: { projectId },
    include: { departments: { select: { id: true, name: true } } },
    orderBy: { number: "asc" },
  });

  return NextResponse.json(vlans, { status: 201 });
}
