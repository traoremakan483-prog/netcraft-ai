/**
 * VLSM (Variable Length Subnet Masking) Engine
 *
 * Algorithm:
 * 1. Parse base network → get total address space
 * 2. Sort departments by estimatedHosts DESC (largest first)
 * 3. For each department, find smallest power-of-2 block that fits (≥ hosts + 2)
 * 4. Assign sequential non-overlapping subnets
 * 5. Validate: no overlap, everything fits
 */

// ─── Types ───

export interface VlsmInput {
  baseNetwork: string; // "192.168.1.0/24"
  departments: {
    id: string;
    name: string;
    estimatedHosts: number;
  }[];
}

export interface SubnetResult {
  departmentId: string;
  departmentName: string;
  networkAddress: string;
  broadcastAddress: string;
  subnetMask: string;
  cidr: number;
  firstHost: string;
  lastHost: string;
  wildcardMask: string;
  gatewayAddress: string;
  totalHosts: number;
  usableHosts: number;
  requestedHosts: number;
  utilization: number; // percentage 0-100
}

export interface VlsmResult {
  subnets: SubnetResult[];
  totalSpace: number;
  usedSpace: number;
  wastedSpace: number;
  remainingBlock: string | null;
  errors: string[];
}

// ─── IP Helpers ───

function ipToInt(ip: string): number {
  const parts = ip.split(".").map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function intToIp(num: number): string {
  return [
    (num >>> 24) & 0xff,
    (num >>> 16) & 0xff,
    (num >>> 8) & 0xff,
    num & 0xff,
  ].join(".");
}

function cidrToMask(cidr: number): number {
  if (cidr === 0) return 0;
  return (~0 << (32 - cidr)) >>> 0;
}

function maskToString(mask: number): string {
  return intToIp(mask);
}

function wildcardFromMask(mask: number): string {
  return intToIp((~mask) >>> 0);
}

/**
 * Find the smallest CIDR prefix that accommodates `needed` total addresses.
 * Total addresses = hosts + 2 (network + broadcast).
 */
function smallestCidr(neededHosts: number): number {
  const totalNeeded = neededHosts + 2; // network + broadcast
  // Find smallest power of 2 >= totalNeeded
  let bits = 0;
  while ((1 << bits) < totalNeeded) bits++;
  const cidr = 32 - bits;
  return cidr < 0 ? 0 : cidr;
}

// ─── Main Engine ───

export function calculateVlsm(input: VlsmInput): VlsmResult {
  const errors: string[] = [];

  // Parse base network
  const parts = input.baseNetwork.split("/");
  if (parts.length !== 2) {
    return { subnets: [], totalSpace: 0, usedSpace: 0, wastedSpace: 0, remainingBlock: null, errors: ["Invalid base network CIDR notation"] };
  }

  const baseIp = ipToInt(parts[0]);
  const baseCidr = parseInt(parts[1], 10);

  if (isNaN(baseCidr) || baseCidr < 0 || baseCidr > 30) {
    return { subnets: [], totalSpace: 0, usedSpace: 0, wastedSpace: 0, remainingBlock: null, errors: ["CIDR must be between 0 and 30"] };
  }

  const baseMask = cidrToMask(baseCidr);
  const baseNetwork = (baseIp & baseMask) >>> 0;
  const totalSpace = (~baseMask >>> 0) + 1; // total addresses in base

  if (input.departments.length === 0) {
    return { subnets: [], totalSpace, usedSpace: 0, wastedSpace: 0, remainingBlock: input.baseNetwork, errors: [] };
  }

  // Sort departments by estimatedHosts DESC (largest subnet first = VLSM best practice)
  const sorted = [...input.departments].sort(
    (a, b) => b.estimatedHosts - a.estimatedHosts
  );

  const subnets: SubnetResult[] = [];
  let pointer = baseNetwork; // Current allocation pointer
  let usedSpace = 0;

  for (const dept of sorted) {
    if (dept.estimatedHosts < 1) {
      errors.push(`${dept.name}: estimatedHosts must be ≥ 1`);
      continue;
    }

    const cidr = smallestCidr(dept.estimatedHosts);
    const blockSize = 1 << (32 - cidr);
    const subnetMask = cidrToMask(cidr);

    // Align pointer to block boundary
    const remainder = pointer % blockSize;
    if (remainder !== 0) {
      pointer = pointer + (blockSize - remainder);
    }

    // Check if we overflow the base network
    if (pointer + blockSize > baseNetwork + totalSpace) {
      errors.push(
        `${dept.name}: needs /${cidr} (${blockSize} addresses) but only ${baseNetwork + totalSpace - pointer} addresses remaining — VLSM overflow`
      );
      continue;
    }

    const networkAddr = pointer;
    const broadcastAddr = (pointer + blockSize - 1) >>> 0;
    const firstHost = (networkAddr + 1) >>> 0;
    const lastHost = (broadcastAddr - 1) >>> 0;
    const gatewayAddr = firstHost; // first usable host is gateway by convention
    const usableHosts = blockSize - 2;
    const utilization =
      usableHosts > 0
        ? Math.round((dept.estimatedHosts / usableHosts) * 100)
        : 0;

    subnets.push({
      departmentId: dept.id,
      departmentName: dept.name,
      networkAddress: intToIp(networkAddr),
      broadcastAddress: intToIp(broadcastAddr),
      subnetMask: maskToString(subnetMask),
      cidr,
      firstHost: intToIp(firstHost),
      lastHost: intToIp(lastHost),
      wildcardMask: wildcardFromMask(subnetMask),
      gatewayAddress: intToIp(gatewayAddr),
      totalHosts: blockSize,
      usableHosts,
      requestedHosts: dept.estimatedHosts,
      utilization,
    });

    pointer += blockSize;
    usedSpace += blockSize;
  }

  const wastedSpace = usedSpace - subnets.reduce((a, s) => a + s.requestedHosts, 0);
  const remaining = totalSpace - usedSpace;
  const remainingBlock =
    remaining > 0
      ? `${intToIp(pointer)}/${32 - Math.floor(Math.log2(remaining))}`
      : null;

  return {
    subnets,
    totalSpace,
    usedSpace,
    wastedSpace,
    remainingBlock,
    errors,
  };
}
