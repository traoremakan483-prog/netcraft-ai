import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Network,
  Sparkles,
  Calculator,
  Tag,
  Cog,
  ShieldCheck,
  ArrowRight,
  Zap,
  Layers,
  Terminal,
  CheckCircle2,
  Cpu,
  Workflow,
} from "lucide-react";
import { auth } from "@/lib/auth";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.807 1.305 3.492.998.108-.776.418-1.305.762-1.605-2.665-.3-5.467-1.332-5.467-5.93 0-1.31.467-2.38 1.236-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.398 3.003-.404 1.02.006 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.234 1.91 1.234 3.22 0 4.61-2.807 5.625-5.479 5.92.43.372.813 1.103.813 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.697.825.578C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-50">
      {/* ─── Background layers ─── */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Grid */}
        <div className="absolute inset-0 bg-grid bg-grid-fade" />
        {/* Animated orbs */}
        <div className="absolute left-[10%] top-[5%] h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-[120px] animate-blob" />
        <div
          className="absolute right-[5%] top-[20%] h-[400px] w-[400px] rounded-full bg-violet-500/20 blur-[120px] animate-blob"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute left-[30%] top-[60%] h-[500px] w-[500px] rounded-full bg-fuchsia-500/15 blur-[140px] animate-blob"
          style={{ animationDelay: "4s" }}
        />
      </div>

      {/* ─── Navbar ─── */}
      <header className="relative z-10 border-b border-zinc-800/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/30">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent" />
              <Network className="relative h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold tracking-tight">NetCraft AI</span>
              <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-500">
                Network Platform
              </span>
            </div>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm text-zinc-400 transition hover:text-zinc-50"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-zinc-400 transition hover:text-zinc-50"
            >
              How it works
            </a>
            <a
              href="#stack"
              className="text-sm text-zinc-400 transition hover:text-zinc-50"
            >
              Stack
            </a>
            <a
              href="https://github.com/traoremakan483-prog/netcraft-ai"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-zinc-400 transition hover:text-zinc-50"
            >
              GitHub
            </a>
          </nav>
          <Link
            href="/login"
            className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition hover:shadow-blue-500/50"
          >
            Sign in
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-20 pb-24 md:pt-32 md:pb-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex animate-slide-down items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-1.5 text-xs backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-zinc-300">Live demo available now</span>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-500">v1.0</span>
          </div>

          {/* Headline */}
          <h1 className="animate-slide-up text-5xl font-bold tracking-tight md:text-7xl">
            Describe your network.
            <br />
            <span className="text-gradient-brand">We build it.</span>
          </h1>

          {/* Subheading */}
          <p
            className="mx-auto mt-8 max-w-2xl animate-slide-up text-lg text-zinc-400 md:text-xl"
            style={{ animationDelay: "0.1s" }}
          >
            A SaaS platform that turns a network description into a full plan:
            VLSM subnets, VLANs, Cisco IOS configurations and 16-rule
            validation — in seconds.
          </p>

          {/* CTAs */}
          <div
            className="mt-10 flex animate-slide-up flex-col items-center justify-center gap-4 sm:flex-row"
            style={{ animationDelay: "0.2s" }}
          >
            <Link
              href="/login"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-violet-600 px-7 py-4 text-base font-semibold text-white shadow-xl shadow-blue-500/30 transition hover:shadow-2xl hover:shadow-blue-500/50"
            >
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition duration-700 group-hover:translate-x-full" />
              <Sparkles className="relative h-5 w-5" />
              <span className="relative">Launch the app</span>
              <ArrowRight className="relative h-5 w-5 transition group-hover:translate-x-1" />
            </Link>
            <a
              href="https://github.com/traoremakan483-prog/netcraft-ai"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 px-7 py-4 text-base font-medium text-zinc-200 backdrop-blur transition hover:border-zinc-700 hover:bg-zinc-900"
            >
              <GithubIcon className="h-5 w-5" />
              <span>View on GitHub</span>
            </a>
          </div>

          {/* Stats */}
          <div
            className="mt-16 grid animate-slide-up grid-cols-2 gap-6 md:grid-cols-4"
            style={{ animationDelay: "0.3s" }}
          >
            {[
              { value: "5", label: "Core engines" },
              { value: "16", label: "Validation rules" },
              { value: "3", label: "Config generators" },
              { value: "∞", label: "Networks planned" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4 backdrop-blur"
              >
                <div className="text-3xl font-bold text-gradient-brand">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs uppercase tracking-wider text-zinc-500">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3D showcase card */}
        <div
          className="mt-24 animate-slide-up perspective-container"
          style={{ animationDelay: "0.4s" }}
        >
          <div
            className="group relative mx-auto max-w-5xl preserve-3d"
            style={{ transform: "rotateX(8deg) rotateY(-2deg)" }}
          >
            {/* Glow */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-fuchsia-500/20 blur-3xl" />
            {/* Window chrome */}
            <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-950/80 px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-rose-500/70" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/70" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/70" />
                </div>
                <div className="ml-4 flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/80 px-3 py-1 font-mono text-xs text-zinc-400">
                  <Terminal className="h-3 w-3" />
                  netcraft-ai / vlsm.out
                </div>
              </div>
              {/* Terminal content */}
              <div className="space-y-2 px-6 py-6 font-mono text-sm leading-relaxed">
                <div className="flex gap-3">
                  <span className="text-emerald-400">$</span>
                  <span className="text-zinc-300">
                    netcraft vlsm --base 192.168.10.0/24
                  </span>
                </div>
                <div className="text-zinc-500"># Calculating optimal allocation…</div>
                <div className="overflow-x-auto">
                  <table className="mt-3 w-full min-w-[640px] text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 text-left text-zinc-500">
                        <th className="py-2 pr-4 font-medium">Department</th>
                        <th className="py-2 pr-4 font-medium">Network</th>
                        <th className="py-2 pr-4 font-medium">Mask</th>
                        <th className="py-2 pr-4 font-medium">Gateway</th>
                        <th className="py-2 font-medium">Hosts</th>
                      </tr>
                    </thead>
                    <tbody className="text-zinc-200">
                      {[
                        ["Open Space", "192.168.10.0", "/26", "192.168.10.1", "62"],
                        ["IT", "192.168.10.64", "/27", "192.168.10.65", "30"],
                        ["Sales", "192.168.10.96", "/27", "192.168.10.97", "30"],
                        ["HR", "192.168.10.128", "/28", "192.168.10.129", "14"],
                        ["Server Room", "192.168.10.144", "/29", "192.168.10.145", "6"],
                      ].map((row, i) => (
                        <tr
                          key={row[0]}
                          className="border-b border-zinc-900 transition hover:bg-zinc-800/30"
                          style={{
                            animation: `fade-in 0.4s ease-out ${0.5 + i * 0.1}s both`,
                          }}
                        >
                          <td className="py-2 pr-4 text-zinc-300">{row[0]}</td>
                          <td className="py-2 pr-4 text-blue-400">{row[1]}</td>
                          <td className="py-2 pr-4 text-violet-400">{row[2]}</td>
                          <td className="py-2 pr-4 text-fuchsia-400">{row[3]}</td>
                          <td className="py-2 text-emerald-400">{row[4]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-zinc-400">
                    5 subnets allocated · 0 overlaps · 98% space efficiency
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section
        id="features"
        className="relative z-10 mx-auto max-w-7xl px-6 py-24"
      >
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-1.5 text-xs uppercase tracking-wider text-zinc-400 backdrop-blur">
            <Zap className="h-3 w-3" />
            Features
          </div>
          <h2 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
            Everything you need to design a network
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Five pure-TypeScript engines that automate what network engineers
            used to do by hand.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Calculator,
              title: "VLSM Engine",
              description:
                "Optimal subnet allocation from any base network. Handles boundary alignment, overflow detection, and utilization tracking.",
              gradient: "from-blue-500 to-cyan-500",
            },
            {
              icon: Tag,
              title: "VLAN Engine",
              description:
                "Auto-assign VLANs by department type with standard numbering. Native VLAN 99 and blackhole VLAN 999 always included.",
              gradient: "from-violet-500 to-fuchsia-500",
            },
            {
              icon: Cog,
              title: "Config Generators",
              description:
                "Complete Cisco IOS configurations for switches, routers, and access points — ready to paste into Packet Tracer or GNS3.",
              gradient: "from-amber-500 to-rose-500",
            },
            {
              icon: ShieldCheck,
              title: "16-Rule Validation",
              description:
                "Catches errors (overflow, overlaps), warnings (VLAN 1, no secret), and recommendations (SSH, exec-timeout) automatically.",
              gradient: "from-emerald-500 to-teal-500",
            },
            {
              icon: Cpu,
              title: "Hostname Convention",
              description:
                "Every device gets a Cisco hostname following the [TYPE]-[SITE]-[ROLE]-[NUMBER] convention with auto-incrementing.",
              gradient: "from-indigo-500 to-blue-500",
            },
            {
              icon: Layers,
              title: "LAN & WAN Topology",
              description:
                "Single-site LAN projects or multi-site WAN projects with branches, departments, and devices — all in one platform.",
              gradient: "from-pink-500 to-rose-500",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:bg-zinc-900/60 hover:shadow-2xl hover:shadow-blue-500/5"
            >
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br opacity-0 blur-3xl transition duration-500 group-hover:opacity-30 ${feature.gradient}" />
              <div
                className={`relative mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/30 to-transparent" />
                <feature.icon className="relative h-6 w-6 text-white" />
              </div>
              <h3 className="relative text-lg font-semibold text-zinc-50">
                {feature.title}
              </h3>
              <p className="relative mt-2 text-sm leading-relaxed text-zinc-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section
        id="how-it-works"
        className="relative z-10 mx-auto max-w-7xl px-6 py-24"
      >
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-1.5 text-xs uppercase tracking-wider text-zinc-400 backdrop-blur">
            <Workflow className="h-3 w-3" />
            How it works
          </div>
          <h2 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
            From idea to deployable config
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Four steps. No manual calculation. No bash scripts.
          </p>
        </div>

        <div className="relative mt-20">
          {/* Connecting line */}
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-zinc-800 to-transparent lg:block" />

          <div className="space-y-16">
            {[
              {
                step: "01",
                title: "Describe your topology",
                description:
                  "Create a project, pick LAN or WAN, and add branches, departments, and devices with estimated host counts.",
                icon: Network,
              },
              {
                step: "02",
                title: "Calculate VLSM & VLANs",
                description:
                  "One click triggers the VLSM engine to allocate subnets optimally, and the VLAN engine to tag each department.",
                icon: Calculator,
              },
              {
                step: "03",
                title: "Generate configurations",
                description:
                  "For every router, switch, and AP, get complete Cisco IOS configurations with DHCP, SSH, STP, and security hardening.",
                icon: Cog,
              },
              {
                step: "04",
                title: "Validate & deploy",
                description:
                  "Run the 16-rule validation engine, fix any issues, then copy each config directly into Packet Tracer, GNS3, or real hardware.",
                icon: ShieldCheck,
              },
            ].map((step, i) => (
              <div
                key={step.step}
                className={`flex flex-col items-center gap-8 lg:flex-row ${
                  i % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className="flex-1">
                  <div
                    className={`relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-8 backdrop-blur-sm ${
                      i % 2 === 0 ? "lg:mr-12" : "lg:ml-12"
                    }`}
                  >
                    <div className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-zinc-600">
                      Step {step.step}
                    </div>
                    <h3 className="text-2xl font-bold text-zinc-50">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-zinc-400">{step.description}</p>
                  </div>
                </div>
                <div className="relative flex h-20 w-20 flex-shrink-0 items-center justify-center">
                  <div className="absolute inset-0 animate-glow-pulse rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600" />
                  <div className="relative flex h-full w-full items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-900">
                    <step.icon className="h-8 w-8 text-blue-400" />
                  </div>
                </div>
                <div className="hidden flex-1 lg:block" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Tech stack marquee ─── */}
      <section id="stack" className="relative z-10 py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Built on a modern, type-safe stack
          </h2>
          <p className="mt-3 text-zinc-400">
            Best-in-class tools from the React and TypeScript ecosystem.
          </p>
        </div>

        <div className="relative mt-12 overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-zinc-950 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-zinc-950 to-transparent" />
          <div className="flex w-max animate-marquee gap-4">
            {[
              ...[
                "Next.js 16",
                "TypeScript 5",
                "Tailwind CSS 4",
                "Prisma 6",
                "Supabase",
                "NextAuth v5",
                "Google OAuth",
                "Zod",
                "Lucide Icons",
                "Vercel",
              ],
              ...[
                "Next.js 16",
                "TypeScript 5",
                "Tailwind CSS 4",
                "Prisma 6",
                "Supabase",
                "NextAuth v5",
                "Google OAuth",
                "Zod",
                "Lucide Icons",
                "Vercel",
              ],
            ].map((tech, i) => (
              <div
                key={`${tech}-${i}`}
                className="flex-shrink-0 rounded-xl border border-zinc-800 bg-zinc-900/50 px-6 py-3 font-mono text-sm text-zinc-300 backdrop-blur"
              >
                {tech}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900/80 to-zinc-900 p-12 text-center backdrop-blur-xl md:p-16">
          {/* Glow */}
          <div className="absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-40 right-1/4 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="relative">
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
              Ready to ship your next network?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">
              Sign in with Google and create your first project in under a
              minute. Free, open source, and live now.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/login"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-violet-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-blue-500/30 transition hover:shadow-2xl hover:shadow-blue-500/50"
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition duration-700 group-hover:translate-x-full" />
                <Sparkles className="relative h-5 w-5" />
                <span className="relative">Launch the app</span>
                <ArrowRight className="relative h-5 w-5 transition group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="relative z-10 border-t border-zinc-800/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600">
              <Network className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm text-zinc-400">
              © 2026 NetCraft AI · Built by{" "}
              <a
                href="https://github.com/traoremakan483-prog"
                target="_blank"
                rel="noreferrer"
                className="text-zinc-200 hover:text-white"
              >
                Makan Traore
              </a>
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a
              href="https://github.com/traoremakan483-prog/netcraft-ai"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-zinc-400 transition hover:text-zinc-50"
            >
              <GithubIcon className="h-4 w-4" />
              GitHub
            </a>
            <Link
              href="/login"
              className="text-zinc-400 transition hover:text-zinc-50"
            >
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
