/**
 * Validation Engine — checks project for errors, warnings, recommendations
 */

export type Severity = "error" | "warning" | "recommendation";

export interface ValidationItem {
  severity: Severity;
  category: string;
  message: string;
  target?: string;
  fix?: string;
}

interface ProjectData {
  type: "LAN" | "WAN" | "LAN_WAN";
  baseNetwork: string | null;
  branches: {
    name: string;
    departments: {
      name: string;
      estimatedHosts: number;
      vlanId: string | null;
      vlan: { number: number; name: string } | null;
      subnet: {
        networkAddress: string;
        broadcastAddress: string;
        gatewayAddress: string;
        cidr: number;
        usableHosts: number;
      } | null;
      devices: {
        name: string;
        hostname: string | null;
        type: string;
        ipAddress: string | null;
      }[];
    }[];
  }[];
  vlans: { number: number; name: string; departments: { id: string }[] }[];
  configs: {
    content: string;
    device: { hostname: string | null; name: string };
  }[];
}

export function validateProject(data: ProjectData): ValidationItem[] {
  const items: ValidationItem[] = [];

  // ─── ERRORS ───

  if (!data.baseNetwork) {
    items.push({
      severity: "error",
      category: "addressing",
      message: "No base network defined",
      fix: "Set a base network (e.g. 192.168.0.0/16) in project settings",
    });
  }

  // ─── PROJECT TYPE CHECKS ───

  const allDepts = data.branches.flatMap((b) => b.departments);

  if (data.type === "LAN" && data.branches.length > 1) {
    items.push({
      severity: "warning",
      category: "topology",
      message: "LAN project has multiple branches — consider switching to WAN or LAN+WAN",
      fix: "Change project type or remove extra branches",
    });
  }

  if ((data.type === "WAN" || data.type === "LAN_WAN") && data.branches.length < 2) {
    items.push({
      severity: "warning",
      category: "topology",
      message: `${data.type} project should have at least 2 branches (sites)`,
      fix: "Add more branches or switch to LAN if this is a single site",
    });
  }

  if (allDepts.length === 0) {
    items.push({
      severity: "error",
      category: "topology",
      message: "No departments defined — add departments to plan your network",
      fix: data.type === "LAN"
        ? "Add departments (IT, Sales, Server Room, etc.)"
        : "Add branches first, then add departments to each branch",
    });
  }

  // Check for departments with no subnet when base network exists
  if (data.baseNetwork) {
    const allDepts = data.branches.flatMap((b) => b.departments);
    const noSubnet = allDepts.filter((d) => !d.subnet);
    if (noSubnet.length > 0 && allDepts.some((d) => d.subnet)) {
      // Some have subnets, some don't — means VLSM wasn't run for all
      for (const d of noSubnet) {
        items.push({
          severity: "error",
          category: "addressing",
          message: `Department "${d.name}" has no subnet assigned`,
          target: d.name,
          fix: "Run VLSM calculation to assign subnets",
        });
      }
    }
  }

  // Check subnet overlaps
  const subnets = data.branches
    .flatMap((b) => b.departments)
    .filter((d) => d.subnet)
    .map((d) => ({
      name: d.name,
      start: ipToInt(d.subnet!.networkAddress),
      end: ipToInt(d.subnet!.broadcastAddress),
    }));

  for (let i = 0; i < subnets.length; i++) {
    for (let j = i + 1; j < subnets.length; j++) {
      const a = subnets[i];
      const b = subnets[j];
      if (a.start <= b.end && b.start <= a.end) {
        items.push({
          severity: "error",
          category: "addressing",
          message: `Subnet overlap between "${a.name}" and "${b.name}"`,
          target: `${a.name}, ${b.name}`,
          fix: "Recalculate VLSM to resolve overlaps",
        });
      }
    }
  }

  // Check VLSM overflow
  if (data.baseNetwork) {
    const baseCidr = parseInt(data.baseNetwork.split("/")[1], 10);
    const totalSpace = 1 << (32 - baseCidr);
    const usedSpace = data.branches
      .flatMap((b) => b.departments)
      .filter((d) => d.subnet)
      .reduce((a, d) => a + (1 << (32 - d.subnet!.cidr)), 0);

    if (usedSpace > totalSpace) {
      items.push({
        severity: "error",
        category: "addressing",
        message: `VLSM overflow: ${usedSpace} addresses used in a /${baseCidr} (${totalSpace} available)`,
        fix: "Use a larger base network or reduce department sizes",
      });
    }
  }

  // Device IP conflicts
  const allDevicesWithIp = data.branches
    .flatMap((b) => b.departments)
    .flatMap((d) => d.devices)
    .filter((dev) => dev.ipAddress);

  const ipMap = new Map<string, string[]>();
  for (const dev of allDevicesWithIp) {
    const existing = ipMap.get(dev.ipAddress!) ?? [];
    existing.push(dev.name);
    ipMap.set(dev.ipAddress!, existing);
  }
  for (const [ip, names] of ipMap) {
    if (names.length > 1) {
      items.push({
        severity: "error",
        category: "addressing",
        message: `IP conflict: ${ip} assigned to ${names.join(", ")}`,
        target: names.join(", "),
        fix: "Assign unique IP addresses",
      });
    }
  }

  // Config checks
  for (const cfg of data.configs) {
    const name = cfg.device.hostname ?? cfg.device.name;

    if (!cfg.content.includes("enable secret")) {
      items.push({
        severity: "error",
        category: "security",
        message: `No enable secret configured`,
        target: name,
        fix: "Add 'enable secret' to the config",
      });
    }

    if (
      cfg.content.includes("switchport") &&
      !cfg.content.includes("ip default-gateway")
    ) {
      items.push({
        severity: "error",
        category: "config",
        message: `L2 switch missing ip default-gateway`,
        target: name,
        fix: "Add 'ip default-gateway' for management access",
      });
    }
  }

  // ─── WARNINGS ───

  for (const v of data.vlans) {
    if (v.number === 1) {
      items.push({
        severity: "warning",
        category: "vlan",
        message: `VLAN 1 is used (${v.name}) — avoid for security`,
        target: v.name,
        fix: "Use a dedicated management VLAN instead of VLAN 1",
      });
    }
  }

  // Check if native VLAN is 1
  for (const cfg of data.configs) {
    const name = cfg.device.hostname ?? cfg.device.name;

    if (cfg.content.includes("trunk native vlan 1")) {
      items.push({
        severity: "warning",
        category: "vlan",
        message: `Trunk using native VLAN 1`,
        target: name,
        fix: "Set native VLAN to 99 or a dedicated unused VLAN",
      });
    }

    if (
      cfg.content.includes("switchport mode trunk") &&
      !cfg.content.includes("trunk allowed vlan")
    ) {
      items.push({
        severity: "warning",
        category: "vlan",
        message: `Trunk without allowed VLAN restriction`,
        target: name,
        fix: "Add 'switchport trunk allowed vlan' to restrict trunk traffic",
      });
    }

    if (
      cfg.content.includes("line vty") &&
      !cfg.content.includes("exec-timeout")
    ) {
      items.push({
        severity: "warning",
        category: "security",
        message: `VTY without exec-timeout`,
        target: name,
        fix: "Add 'exec-timeout 5 0' to VTY lines",
      });
    }

    if (
      cfg.content.includes("ip dhcp pool") &&
      !cfg.content.includes("ip dhcp excluded-address")
    ) {
      items.push({
        severity: "warning",
        category: "config",
        message: `DHCP pool without excluded-address`,
        target: name,
        fix: "Exclude gateway addresses from DHCP pool",
      });
    }

    // Check unused ports not shut down
    if (
      cfg.content.includes("UNUSED") &&
      !cfg.content.includes("shutdown")
    ) {
      items.push({
        severity: "warning",
        category: "security",
        message: `Unused ports not shut down`,
        target: name,
        fix: "Shut down unused ports and assign to blackhole VLAN",
      });
    }
  }

  // ─── RECOMMENDATIONS ───

  for (const cfg of data.configs) {
    const name = cfg.device.hostname ?? cfg.device.name;

    if (!cfg.content.includes("banner motd")) {
      items.push({
        severity: "recommendation",
        category: "security",
        message: `No login banner configured`,
        target: name,
        fix: "Add 'banner motd' for legal notice",
      });
    }

    if (
      cfg.content.includes("transport input telnet") ||
      (!cfg.content.includes("transport input ssh") &&
        cfg.content.includes("line vty"))
    ) {
      items.push({
        severity: "recommendation",
        category: "security",
        message: `Consider SSH over Telnet for VTY access`,
        target: name,
        fix: "Use 'transport input ssh' instead of telnet",
      });
    }
  }

  // VLANs with no departments
  for (const v of data.vlans) {
    if (v.departments.length === 0 && v.number !== 99 && v.number !== 999) {
      items.push({
        severity: "recommendation",
        category: "vlan",
        message: `VLAN ${v.number} (${v.name}) exists but not assigned to any department`,
        target: v.name,
        fix: "Assign the VLAN to a department or remove it",
      });
    }
  }

  // Departments with no devices
  for (const branch of data.branches) {
    for (const dept of branch.departments) {
      if (dept.devices.length === 0) {
        items.push({
          severity: "recommendation",
          category: "config",
          message: `Department "${dept.name}" has no devices`,
          target: dept.name,
          fix: "Add devices to generate configs",
        });
      }
    }
  }

  return items;
}

function ipToInt(ip: string): number {
  const parts = ip.split(".").map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}
