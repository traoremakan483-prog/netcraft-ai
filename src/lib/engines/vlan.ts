/**
 * VLAN Engine — auto-suggest VLANs based on department types
 *
 * Rules:
 *   MANAGEMENT  → 10  → VLAN_MGMT
 *   IT          → 20  → VLAN_IT
 *   SALES       → 30  → VLAN_SALES
 *   HR          → 40  → VLAN_HR
 *   SERVER_ROOM → 50  → VLAN_SERVERS
 *   RECEPTION   → 60  → VLAN_RECEPTION
 *   SECURITY    → 70  → VLAN_SECURITY
 *   MEETING_ROOM→ 80  → VLAN_MEETING
 *   OPEN_SPACE  → 90  → VLAN_OPENSPACE
 *   CUSTOM      → 100+ → VLAN_[NAME]
 *
 * Auto-add: VLAN 99 = NATIVE, VLAN 999 = BLACKHOLE
 */

import type { DepartmentType } from "@prisma/client";

export interface VlanSuggestion {
  number: number;
  name: string;
  description: string;
  departmentIds: string[];
}

interface DeptInput {
  id: string;
  name: string;
  type: DepartmentType;
}

const TYPE_MAP: Record<string, { number: number; name: string }> = {
  MANAGEMENT: { number: 10, name: "VLAN_MGMT" },
  IT: { number: 20, name: "VLAN_IT" },
  SALES: { number: 30, name: "VLAN_SALES" },
  HR: { number: 40, name: "VLAN_HR" },
  SERVER_ROOM: { number: 50, name: "VLAN_SERVERS" },
  RECEPTION: { number: 60, name: "VLAN_RECEPTION" },
  SECURITY: { number: 70, name: "VLAN_SECURITY" },
  MEETING_ROOM: { number: 80, name: "VLAN_MEETING" },
  OPEN_SPACE: { number: 90, name: "VLAN_OPENSPACE" },
};

export function suggestVlans(departments: DeptInput[]): VlanSuggestion[] {
  const vlans = new Map<number, VlanSuggestion>();
  let customCounter = 100;

  for (const dept of departments) {
    const mapped = TYPE_MAP[dept.type];

    if (mapped) {
      const existing = vlans.get(mapped.number);
      if (existing) {
        existing.departmentIds.push(dept.id);
        existing.description += `, ${dept.name}`;
      } else {
        vlans.set(mapped.number, {
          number: mapped.number,
          name: mapped.name,
          description: dept.name,
          departmentIds: [dept.id],
        });
      }
    } else {
      // CUSTOM type
      const sanitized = dept.name
        .replace(/[^a-zA-Z0-9]/g, "_")
        .toUpperCase()
        .slice(0, 20);
      vlans.set(customCounter, {
        number: customCounter,
        name: `VLAN_${sanitized}`,
        description: dept.name,
        departmentIds: [dept.id],
      });
      customCounter += 10;
    }
  }

  // Always add NATIVE (99) and BLACKHOLE (999)
  if (!vlans.has(99)) {
    vlans.set(99, {
      number: 99,
      name: "NATIVE",
      description: "Trunk native VLAN",
      departmentIds: [],
    });
  }
  if (!vlans.has(999)) {
    vlans.set(999, {
      number: 999,
      name: "BLACKHOLE",
      description: "Unused ports — security sink",
      departmentIds: [],
    });
  }

  return Array.from(vlans.values()).sort((a, b) => a.number - b.number);
}
