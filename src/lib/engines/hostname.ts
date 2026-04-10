import type { DeviceType } from "@prisma/client";

/**
 * Hostname convention: [TYPE_PREFIX]-[SITE_CODE]-[ROLE]-[NUMBER]
 *
 * Examples:
 *   RTR-HQ-CORE-01
 *   SW-HQ-ACCESS-01
 *   AP-BKL-FLOOR1-01
 *   SRV-HQ-DHCP-01
 */

const TYPE_PREFIX: Record<string, string> = {
  ROUTER: "RTR",
  FIREWALL: "FW",
  CORE_SWITCH: "SW",
  DISTRIBUTION_SWITCH: "SW",
  ACCESS_SWITCH: "SW",
  AUTONOMOUS_AP: "AP",
  LIGHTWEIGHT_AP: "AP",
  WLC: "WLC",
  DHCP_SERVER: "SRV",
  DNS_SERVER: "SRV",
  WEB_SERVER: "SRV",
  FILE_SERVER: "SRV",
  EMAIL_SERVER: "SRV",
  NTP_SERVER: "SRV",
};

const ROLE_SUFFIX: Partial<Record<DeviceType, string>> = {
  ROUTER: "CORE",
  FIREWALL: "FW",
  CORE_SWITCH: "CORE",
  DISTRIBUTION_SWITCH: "DIST",
  ACCESS_SWITCH: "ACCESS",
  AUTONOMOUS_AP: "AP",
  LIGHTWEIGHT_AP: "LWAP",
  WLC: "WLC",
  DHCP_SERVER: "DHCP",
  DNS_SERVER: "DNS",
  WEB_SERVER: "WEB",
  FILE_SERVER: "FILE",
  EMAIL_SERVER: "MAIL",
  NTP_SERVER: "NTP",
};

// Endpoints don't get hostnames
const ENDPOINT_TYPES: DeviceType[] = [
  "PC",
  "LAPTOP",
  "IP_PHONE",
  "PRINTER",
  "CCTV",
  "IOT_DEVICE",
];

/**
 * Sanitize branch name to a short uppercase site code.
 * "HQ" → "HQ", "Branch-KL" → "BKL", "Site Alpha" → "SALPHA"
 */
function siteCode(branchName: string): string {
  return branchName
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 5);
}

export function isEndpoint(type: DeviceType): boolean {
  return ENDPOINT_TYPES.includes(type);
}

export function generateHostname(
  deviceType: DeviceType,
  branchName: string,
  existingHostnames: string[]
): string | null {
  if (isEndpoint(deviceType)) return null;

  const prefix = TYPE_PREFIX[deviceType] ?? "DEV";
  const site = siteCode(branchName);
  const role = ROLE_SUFFIX[deviceType] ?? "GEN";

  // Find next available number
  const pattern = `${prefix}-${site}-${role}-`;
  const existingNumbers = existingHostnames
    .filter((h) => h.startsWith(pattern))
    .map((h) => {
      const num = parseInt(h.slice(pattern.length), 10);
      return isNaN(num) ? 0 : num;
    });

  const next = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;

  return `${prefix}-${site}-${role}-${String(next).padStart(2, "0")}`;
}
