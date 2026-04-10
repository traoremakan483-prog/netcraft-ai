import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { generateHostname } from "@/lib/engines/hostname";
import type { DeviceType } from "@prisma/client";

type Ctx = {
  params: Promise<{ projectId: string; branchId: string; deptId: string }>;
};

const DEVICE_TYPES = [
  "ROUTER", "FIREWALL", "CORE_SWITCH", "DISTRIBUTION_SWITCH", "ACCESS_SWITCH",
  "AUTONOMOUS_AP", "LIGHTWEIGHT_AP", "WLC",
  "DHCP_SERVER", "DNS_SERVER", "WEB_SERVER", "FILE_SERVER", "EMAIL_SERVER", "NTP_SERVER",
  "PC", "LAPTOP", "IP_PHONE", "PRINTER", "CCTV", "IOT_DEVICE",
] as const;

const createSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(DEVICE_TYPES),
  notes: z.string().max(500).optional(),
});

// GET — list devices in department
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
  });
  if (!dept)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const devices = await db.device.findMany({
    where: { departmentId: deptId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(devices);
}

// POST — create device with auto-generated hostname
export async function POST(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId, branchId, deptId } = await params;

  // Verify ownership chain
  const dept = await db.department.findFirst({
    where: {
      id: deptId,
      branchId,
      branch: { projectId, project: { userId: session.user.id } },
    },
    include: { branch: true },
  });
  if (!dept)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );

  // Get existing hostnames in the branch for numbering
  const existingDevices = await db.device.findMany({
    where: { department: { branchId } },
    select: { hostname: true },
  });
  const existingHostnames = existingDevices
    .map((d) => d.hostname)
    .filter((h): h is string => h !== null);

  const hostname = generateHostname(
    parsed.data.type as DeviceType,
    dept.branch.name,
    existingHostnames
  );

  const device = await db.device.create({
    data: {
      name: parsed.data.name,
      type: parsed.data.type,
      hostname,
      notes: parsed.data.notes,
      departmentId: deptId,
    },
  });

  return NextResponse.json(device, { status: 201 });
}
