import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

type Ctx = { params: Promise<{ projectId: string }> };

const createSchema = z.object({
  name: z.string().min(1).max(100),
  location: z.string().max(200).optional(),
});

// GET /api/projects/[projectId]/branches
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

  const branches = await db.branch.findMany({
    where: { projectId },
    include: {
      _count: { select: { departments: true } },
      departments: {
        include: { _count: { select: { devices: true } } },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(branches);
}

// POST /api/projects/[projectId]/branches
export async function POST(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;
  const project = await db.project.findFirst({
    where: { id: projectId, userId: session.user.id },
  });
  if (!project)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // LAN projects have a single auto-created branch — no manual branches allowed
  if (project.type === "LAN") {
    return NextResponse.json(
      { error: "LAN projects have a single site. Switch to WAN or LAN+WAN to add branches." },
      { status: 400 }
    );
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );

  const branch = await db.branch.create({
    data: { ...parsed.data, projectId },
  });

  return NextResponse.json(branch, { status: 201 });
}
