# NetCraft AI

> You describe your network. NetCraft AI builds it.

**NetCraft AI** is a SaaS platform for automated network infrastructure planning and configuration. Users describe their network topology (sites, departments, devices), and the application automatically generates the IP addressing plan (VLSM), VLANs, Cisco IOS configurations for each device, and validates the entire design against 16 best-practice rules.

**[Launch the App](https://netcraft-ai.vercel.app)**

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase)

---

## Table of Contents

- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Features](#features)
- [Project Types](#project-types)
- [User Guide](#user-guide)
- [Technical Architecture](#technical-architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [Core Engines](#core-engines)
- [Local Installation](#local-installation)
- [Deployment](#deployment)
- [Security](#security)
- [Author](#author)

---

## The Problem

When designing an enterprise network, you have to:

1. **Manually calculate subnets** (VLSM) — find masks, address ranges, gateways, avoid overlaps
2. **Assign VLANs** — decide which number for which department, remember native and blackhole VLANs
3. **Write Cisco configurations** — dozens of CLI lines per device, with VLANs, trunking, DHCP, SSH, STP...
4. **Verify everything is consistent** — no IP overlap, no unused VLANs, no security holes

This process is long, repetitive, and error-prone. One wrong mask, one bad VLAN number, one unsecured port — and the network goes down or becomes vulnerable.

## The Solution

**NetCraft AI automates all of that.** In just a few clicks:

- Define your topology (sites, departments, devices)
- Click **"Calculate VLSM"** and all subnets are optimally generated
- Click **"Auto-suggest VLANs"** and each department gets a VLAN matching its role
- Click **"Generate Configs"** and get complete Cisco IOS configurations, ready to copy-paste
- Click **"Run Validation"** and 16 rules verify your design is correct and secure

---

## Features

### 1. Project Management

- Create, edit, and delete network projects
- Choose the topology type: LAN, WAN, or LAN+WAN
- Define the base address space (e.g., `192.168.10.0/24`, `10.0.0.0/8`)
- Dashboard with real-time statistics (projects, devices, subnets)

### 2. Network Topology

**For LAN projects (single site):**
- Add departments directly (IT, Sales, HR, Server Room, etc.)
- Add devices within each department

**For WAN or LAN+WAN projects (multi-site):**
- Create branches/sites (e.g., HQ, Branch Office Bamako, Office Dakar)
- Each branch contains its own departments and devices

### 3. Device Management

Each department can contain devices organized by category:

| Category | Device Types |
|----------|-------------|
| **Routers** | Core Router, Edge Router, Branch Router |
| **Switches** | Layer 2 Switch, Layer 3 Switch, PoE Switch |
| **Access Points** | Access Point (AP) |
| **Endpoints** | PC, Laptop, IP Phone, Printer, IP Camera, Server |

Every network device (router, switch, AP) automatically receives a **Cisco hostname** following the convention:
```
[TYPE]-[SITE_CODE]-[ROLE]-[NUMBER]
```
Examples: `RTR-HQ-CORE-01`, `SW-BKL-ACCESS-02`, `AP-DKR-WIFI-01`

### 4. Automatic VLSM Calculation

The VLSM (Variable Length Subnet Masking) engine:
- Takes the base address space and the list of all departments
- Sorts by host count (largest first for optimal allocation)
- Calculates the smallest power-of-2 block that fits each department
- Aligns subnets on correct boundaries
- Verifies no overflow occurs

**Result:** A complete table showing for each department:
- Network address, mask, CIDR, broadcast
- First and last usable host
- Gateway address
- Wildcard mask
- Total capacity and utilization rate

### 5. Automatic VLAN Assignment

The VLAN engine automatically assigns a VLAN number based on department type:

| Department Type | VLAN |
|----------------|------|
| Management | 10 |
| IT | 20 |
| Sales | 30 |
| HR | 40 |
| Server Room | 50 |
| Reception | 60 |
| Open Space | 70 |
| Meeting Room | 80 |
| Security | 90 |

Two special VLANs are always added:
- **VLAN 99 (NATIVE)** — Native VLAN for trunk links
- **VLAN 999 (BLACKHOLE)** — Security VLAN for unused ports

### 6. Cisco IOS Configuration Generation

Three configuration generators:

**Switch (Layer 2/3):**
- All VLAN declarations
- Access ports with correct VLAN assignment
- Trunk ports with allowed VLANs
- Unused ports in VLAN 999 + shutdown (security hardening)
- STP mode rapid-pvst
- Management interface with IP

**Router:**
- Router-on-a-stick sub-interfaces for each VLAN
- DHCP pools with excluded addresses (gateway + servers)
- SSH v2 configuration with `crypto key generate rsa modulus 2048`
- Default route
- Login banner
- `enable secret` and `service password-encryption`

**Access Point (AP):**
- SSID with WPA2-PSK
- Dual-band radios (2.4 GHz + 5 GHz)
- BVI interface for management
- Secure base configuration

Each config is displayed with:
- Line numbers
- Syntax highlighting
- Copy to clipboard button
- Download as `.txt` button

### 7. Design Validation (16 Rules)

The validation engine checks:

**Errors (blocking):**
- No base network defined
- VLSM overflow (insufficient address space)
- Subnet overlaps
- IP address conflicts
- No departments defined
- Project type / branch count mismatch

**Warnings:**
- No `enable secret` in configs
- No default gateway
- VLAN 1 in use (security risk)
- Unrestricted trunk ports
- WAN project with fewer than 2 branches

**Recommendations:**
- Add `exec-timeout` on console/vty lines
- Exclude gateway addresses from DHCP pools
- Secure unused ports
- Add login banner
- Use SSH instead of Telnet
- Remove unassigned VLANs

### 8. User Interface

- **Dark mode** exclusive with glassmorphism design
- **Smooth animations**: fade-in, slide-up, hover lift on cards
- **Gradients** on buttons, headings, and accents
- **Responsive**: desktop sidebar, mobile drawer with hamburger menu
- **Loading states**: animated skeletons on every page
- **Tabbed navigation** on projects (Overview, Subnets, VLANs, Configs, Validation)

---

## Project Types

### LAN — Local Area Network (single site)

```
Project "Campus HQ"
├── IT Department (30 hosts)
├── Sales Department (20 hosts)
├── Server Room (10 hosts)
└── Open Space (50 hosts)
```

Ideal for: a single office, campus, or building. Users add departments directly without creating branches.

### WAN — Wide Area Network (multi-site)

```
Project "National Network"
├── Branch HQ (Bamako)
│   ├── IT (30 hosts)
│   └── Management (10 hosts)
├── Branch Office (Dakar)
│   ├── Sales (15 hosts)
│   └── Support (10 hosts)
└── Branch Office (Abidjan)
    └── Open Space (20 hosts)
```

Ideal for: an enterprise with multiple geographic locations. Each branch represents a physical site.

### LAN+WAN — Combined

Same structure as WAN, but with the intent to plan each site's local network in detail. Behavior in the application is identical to WAN.

---

## User Guide

### Step 1: Create a Project

1. Go to the Dashboard
2. Click **"New Project"**
3. Fill in the name, description, choose the type (LAN/WAN/LAN+WAN)
4. Enter the base network in CIDR notation (e.g., `192.168.10.0/24`)
5. Click **"Create Project"**

### Step 2: Define the Topology

**If LAN:** Add departments directly on the project overview page.

**If WAN/LAN+WAN:** Create branches (sites) first, then add departments within each branch.

For each department, specify:
- Name (e.g., "IT Department")
- Type (IT, Sales, HR, etc.) — determines the auto-assigned VLAN
- Estimated host count — determines the subnet size

### Step 3: Add Devices

In each department, click **"+ Add Device"** and choose the device type. Routers, switches, and APs will receive an automatic hostname.

### Step 4: Generate the Network Plan

1. Go to **Subnets** tab > click **"Calculate VLSM"**
2. Go to **VLANs** tab > click **"Auto-suggest VLANs"**
3. Go to **Configs** tab > click **"Generate All Configs"**
4. Go to **Validation** tab > click **"Run Validation"**

### Step 5: Export

- Copy each configuration with the **Copy** button
- Download each config as `.txt` with the **Download** button
- Paste directly into a Cisco terminal or simulator (Packet Tracer, GNS3, EVE-NG)

---

## Technical Architecture

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│         Next.js 16 (App Router + RSC)           │
│         Tailwind CSS v4 (Dark mode)             │
├─────────────────────────────────────────────────┤
│                 API Routes                       │
│        REST endpoints (Next.js Route Handlers)  │
│        Zod validation on all inputs             │
│        Session-based ownership checks           │
├─────────────────────────────────────────────────┤
│               Core Engines                       │
│   VLSM | VLAN | Hostname | Config | Validate   │
│        Pure TypeScript — zero dependencies       │
├─────────────────────────────────────────────────┤
│                   ORM                            │
│              Prisma 6 Client                     │
├─────────────────────────────────────────────────┤
│                 Database                         │
│          Supabase PostgreSQL                     │
├─────────────────────────────────────────────────┤
│              Authentication                      │
│      NextAuth v5 + Google OAuth + JWT           │
└─────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router + Turbopack) | 16.2 |
| Language | TypeScript | 5 |
| Styling | Tailwind CSS | 4 |
| Database | PostgreSQL via Supabase | - |
| ORM | Prisma | 6 |
| Authentication | NextAuth (Auth.js) + Google OAuth | 5 |
| Icons | Lucide React | - |
| Validation | Zod | - |
| CSS Utilities | clsx + tailwind-merge | - |
| Deployment | Vercel | - |

---

## Project Structure

```
netcraft-ai/
├── prisma/
│   └── schema.prisma              # 10 models (User, Project, Branch, Department, Device, Subnet, Vlan, Config, Account, Session)
├── src/
│   ├── app/
│   │   ├── globals.css            # Tailwind v4 + keyframe animations
│   │   ├── layout.tsx             # Root layout (fonts, dark mode)
│   │   ├── page.tsx               # Redirect to /dashboard
│   │   ├── (auth)/
│   │   │   └── login/page.tsx     # Google sign-in page (glassmorphism)
│   │   ├── (app)/
│   │   │   ├── layout.tsx         # App shell (sidebar + topbar)
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx       # Stats + recent projects
│   │   │   │   └── loading.tsx    # Loading skeleton
│   │   │   └── projects/
│   │   │       ├── page.tsx       # All projects grid
│   │   │       ├── new/page.tsx   # Creation form
│   │   │       └── [projectId]/
│   │   │           ├── page.tsx       # Overview (adapts to LAN vs WAN)
│   │   │           ├── layout.tsx     # Tab navigation
│   │   │           ├── subnets/       # VLSM table
│   │   │           ├── vlans/         # VLANs table
│   │   │           ├── configs/       # Config viewer
│   │   │           ├── validation/    # Validation results
│   │   │           └── branches/[branchId]/  # Branch detail (WAN)
│   │   └── api/                   # 11 REST endpoints
│   ├── components/
│   │   ├── layout/                # Sidebar (responsive), Topbar (search, avatar)
│   │   ├── projects/              # ProjectNav (tabs)
│   │   ├── branches/              # AddBranchForm
│   │   ├── departments/           # AddDepartmentForm (type select, hosts input)
│   │   ├── devices/               # AddDeviceForm (categorized grid)
│   │   ├── vlsm/                  # VlsmPanel (button + 11-column table)
│   │   ├── vlans/                 # VlanPanel (suggestion + badge table)
│   │   ├── configs/               # ConfigPanel (tabs, line numbers, copy, download)
│   │   ├── validation/            # ValidationPanel (errors/warnings/recommendations)
│   │   └── ui/                    # Skeleton, DeleteButton (with confirmation)
│   └── lib/
│       ├── engines/
│       │   ├── vlsm.ts           # Pure VLSM algorithm
│       │   ├── vlan.ts           # VLAN suggestion by type
│       │   ├── hostname.ts       # Cisco naming convention
│       │   ├── config-switch.ts  # Switch config generator
│       │   ├── config-router.ts  # Router config generator
│       │   ├── config-ap.ts      # AP config generator
│       │   └── validate.ts       # 16 validation rules
│       ├── auth.ts               # NextAuth v5 config
│       ├── db.ts                 # Prisma singleton
│       └── utils.ts              # cn() helper
├── .env.example                   # Environment variable template
├── .gitignore                     # .env* ignored, node_modules ignored
└── package.json
```

---

## Data Model

```
User (NextAuth)
│
└── Project
    ├── type: LAN | WAN | LAN_WAN
    ├── baseNetwork: "192.168.10.0/24"
    │
    ├── Branch(es)                    # 1 auto-created for LAN, N for WAN
    │   ├── name: "HQ"
    │   ├── location: "Bamako"
    │   │
    │   └── Department(s)
    │       ├── name: "IT"
    │       ├── type: IT | SALES | HR | MANAGEMENT | SERVER_ROOM | ...
    │       ├── estimatedHosts: 30
    │       ├── vlan → Vlan
    │       ├── subnet → Subnet
    │       │
    │       └── Device(s)
    │           ├── name: "Main Switch"
    │           ├── type: CORE_ROUTER | SWITCH_L2 | SWITCH_L3 | AP | ENDPOINT | ...
    │           ├── hostname: "SW-HQ-ACCESS-01" (auto-generated)
    │           └── config → Config (Cisco IOS content)
    │
    ├── Subnet(s)                     # Generated by VLSM engine
    │   ├── networkAddress: "192.168.10.0"
    │   ├── subnetMask: "255.255.255.224"
    │   ├── cidr: 27
    │   ├── firstHost / lastHost / broadcastAddress / gatewayAddress
    │   ├── usableHosts: 30
    │   └── utilization: 100 (%)
    │
    └── Vlan(s)                       # Generated by VLAN engine
        ├── number: 20
        ├── name: "IT"
        └── departments[] (N:1)
```

---

## Core Engines

All engines are pure TypeScript functions with zero external dependencies, fully unit-testable.

### VLSM (`src/lib/engines/vlsm.ts`)

Algorithm:
1. Receive the base network and list of departments with host counts
2. Sort departments by host count descending (optimal allocation)
3. For each department, find the smallest power-of-2 block >= (hosts + 2)
4. Align the start address on the block boundary
5. Verify no overflow beyond the available space
6. Return complete details for each subnet

### VLAN (`src/lib/engines/vlan.ts`)

- Maps each department type to a standard VLAN number
- Handles conflicts when multiple departments of the same type exist (increments)
- Always adds VLAN 99 (Native) and VLAN 999 (Blackhole)

### Hostname (`src/lib/engines/hostname.ts`)

- Format: `[TYPE_PREFIX]-[SITE_CODE]-[ROLE]-[NUMBER]`
- Prefixes: RTR (router), SW (switch), AP (access point)
- Auto-increments the number if a hostname already exists

### Config Switch (`src/lib/engines/config-switch.ts`)

Generates a complete Cisco IOS configuration including:
- `hostname`, `service password-encryption`, `enable secret`
- All VLAN declarations
- Access ports with `switchport mode access` and correct VLAN
- Trunk port with `switchport trunk allowed vlan`
- Unused ports: `switchport access vlan 999` + `shutdown`
- `spanning-tree mode rapid-pvst`
- Management VLAN interface with IP

### Config Router (`src/lib/engines/config-router.ts`)

Generates:
- Router-on-a-stick sub-interfaces on GigabitEthernet0/0 for each VLAN
- DHCP pools with `network`, `default-router`, `dns-server`
- Excluded addresses (`ip dhcp excluded-address`)
- SSH v2 with `crypto key generate rsa modulus 2048`
- `ip route 0.0.0.0 0.0.0.0 [next-hop]`
- Banner and line security

### Config AP (`src/lib/engines/config-ap.ts`)

Generates:
- SSID with `authentication open`
- `encryption mode ciphers aes-ccm`
- WPA2-PSK
- Radios `dot11radio 0` (2.4 GHz) and `dot11radio 1` (5 GHz)
- BVI interface for management

### Validation (`src/lib/engines/validate.ts`)

16 rules organized in 3 severity levels:
- **Errors**: blocking issues (no network, overflow, overlaps)
- **Warnings**: security risks (VLAN 1, no secret, no gateway)
- **Recommendations**: best practices (SSH, timeouts, banner, unused ports)

---

## Local Installation

### Prerequisites

- **Node.js 18+**
- A **[Supabase](https://supabase.com)** project (free tier works fine)
- **Google OAuth** credentials from [Google Cloud Console](https://console.cloud.google.com)

### 1. Clone the repo

```bash
git clone https://github.com/traoremakan483-prog/netcraft-ai.git
cd netcraft-ai
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres"
AUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-secret"
```

### 3. Set up Google OAuth

1. Go to Google Cloud Console > APIs & Services > Credentials
2. Create an **OAuth 2.0 Client ID** (type: Web Application)
3. Add the redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy the Client ID and Client Secret into `.env.local`

### 4. Initialize the database

```bash
npx prisma db push
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with Google.

---

## Deployment

The application is ready for **Vercel**:

1. Connect the GitHub repo to Vercel
2. Add environment variables in Vercel settings:
   - `DATABASE_URL` (use the Supabase **Session Pooler** URL for serverless)
   - `DIRECT_URL` (use the Supabase **Direct** connection URL)
   - `AUTH_SECRET`
   - `AUTH_TRUST_HOST=true`
   - `AUTH_URL=https://your-domain.vercel.app`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
3. Add the production redirect URI in Google Cloud Console:
   `https://your-domain.vercel.app/api/auth/callback/google`
4. Deploy

---

## Security

- All secrets are stored in `.env.local` which is **git-ignored** — never committed
- Only `.env.example` (with placeholders) is tracked in the repo
- Authentication via Google OAuth (NextAuth v5, JWT strategy)
- All API routes verify session and resource ownership
- Zod validation on all user inputs
- No credentials exposed in source code

---

## Author

**Makan Traore**
- Email: traoremakan483@gmail.com
- GitHub: [@traoremakan483-prog](https://github.com/traoremakan483-prog)

---

## License

MIT — Free to use, modify, and distribute.
