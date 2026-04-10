import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateSwitchConfig } from "@/lib/engines/config-switch";
import { generateRouterConfig } from "@/lib/engines/config-router";
import { generateApConfig } from "@/lib/engines/config-ap";
import type { DeviceType, ConfigType } from "@prisma/client";

type Ctx = { params: Promise<{ projectId: string }> };

const SWITCH_TYPES: DeviceType[] = [
  "CORE_SWITCH",
  "DISTRIBUTION_SWITCH",
  "ACCESS_SWITCH",
];
const ROUTER_TYPES: DeviceType[] = ["ROUTER", "FIREWALL"];
const AP_TYPES: DeviceType[] = ["AUTONOMOUS_AP", "LIGHTWEIGHT_AP", "WLC"];

// POST /api/projects/[projectId]/configs — generate and persist all configs
export async function POST(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;

  const project = await db.project.findFirst({
    where: { id: projectId, userId: session.user.id },
    include: {
      vlans: true,
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
      },
    },
  });

  if (!project)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const vlans = project.vlans.map((v) => ({ number: v.number, name: v.name }));
  const allVlanNumbers = vlans.map((v) => v.number);

  const configs: { deviceId: string; type: ConfigType; content: string }[] = [];

  for (const branch of project.branches) {
    for (const dept of branch.departments) {
      for (const device of dept.devices) {
        if (!device.hostname) continue;

        if (SWITCH_TYPES.includes(device.type)) {
          const accessVlan = dept.vlan?.number ?? 20;
          const content = generateSwitchConfig({
            hostname: device.hostname,
            projectName: project.name,
            branchName: branch.name,
            vlans,
            departmentName: dept.name,
            accessVlan,
            trunkAllowedVlans: allVlanNumbers.filter((n) => n !== 999),
            managementVlan: 10,
            managementIp: dept.subnet?.gatewayAddress,
            managementMask: dept.subnet?.subnetMask,
            gateway: dept.subnet?.gatewayAddress,
            accessPortCount: Math.min(dept.estimatedHosts, 20),
            trunkPort: "GigabitEthernet0/1",
            uplink: `RTR-${branch.name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 5)}-CORE-01`,
          });
          configs.push({ deviceId: device.id, type: "SWITCH", content });
        }

        if (ROUTER_TYPES.includes(device.type)) {
          const subInterfaces = project.vlans
            .filter((v) => v.number !== 999)
            .map((v) => {
              const linkedDept = branch.departments.find(
                (d) => d.vlanId === v.id
              );
              return {
                vlanNumber: v.number,
                vlanName: v.name,
                gateway: linkedDept?.subnet?.gatewayAddress ?? "[GATEWAY]",
                mask: linkedDept?.subnet?.subnetMask ?? "[MASK]",
                network:
                  linkedDept?.subnet?.networkAddress ?? "[NETWORK]",
              };
            });

          const content = generateRouterConfig({
            hostname: device.hostname,
            projectName: project.name,
            branchName: branch.name,
            subInterfaces,
          });
          configs.push({ deviceId: device.id, type: "ROUTER", content });
        }

        if (AP_TYPES.includes(device.type)) {
          const content = generateApConfig({
            hostname: device.hostname,
            projectName: project.name,
            branchName: branch.name,
            ssidName: `${project.name.replace(/\s/g, "_")}_WIFI`,
            vlanNumber: dept.vlan?.number ?? 90,
            managementIp: dept.subnet?.gatewayAddress,
            managementMask: dept.subnet?.subnetMask,
            gateway: dept.subnet?.gatewayAddress,
          });
          configs.push({ deviceId: device.id, type: "AP", content });
        }
      }
    }
  }

  if (configs.length === 0) {
    return NextResponse.json(
      {
        error:
          "No configurable devices found (need switches, routers, or APs with hostnames)",
      },
      { status: 400 }
    );
  }

  // Delete old configs, insert new
  await db.config.deleteMany({
    where: { device: { department: { branch: { projectId } } } },
  });

  await db.config.createMany({ data: configs });

  const result = await db.config.findMany({
    where: { device: { department: { branch: { projectId } } } },
    include: {
      device: { select: { hostname: true, name: true, type: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(result, { status: 201 });
}
