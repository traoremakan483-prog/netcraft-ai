import { signIn } from "@/lib/auth";
import { Network } from "lucide-react";

export const dynamic = "force-dynamic";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4">
      {/* Animated gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl animate-glow-pulse" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/15 blur-3xl animate-glow-pulse [animation-delay:1s]" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl animate-glow-pulse [animation-delay:0.5s]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-sm animate-scale-in">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/25">
            <Network className="h-5 w-5 text-white" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-zinc-50">
            NetCraft{" "}
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              AI
            </span>
          </span>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-7 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <h1 className="text-xl font-bold text-zinc-50">Welcome back</h1>
          <p className="mt-1.5 text-sm text-zinc-400">
            Sign in to design, plan and configure your networks.
          </p>

          <form
            action={async () => {
              "use server";
              const params = await searchParams;
              await signIn("google", {
                redirectTo: params?.callbackUrl ?? "/dashboard",
              });
            }}
            className="mt-7"
          >
            <button
              type="submit"
              className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl border border-zinc-700/80 bg-zinc-800/80 px-4 py-3 text-sm font-semibold text-zinc-100 transition-all duration-300 hover:border-zinc-600 hover:bg-zinc-800 hover:shadow-lg hover:shadow-blue-500/10"
            >
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <GoogleIcon />
              Continue with Google
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-[10px] uppercase tracking-widest text-zinc-600">
              Secure auth
            </span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          <p className="mt-4 text-center text-xs text-zinc-500">
            By signing in you agree to the{" "}
            <span className="text-zinc-400 underline decoration-zinc-700 underline-offset-2 hover:text-zinc-300 cursor-pointer">
              terms of use
            </span>
            .
          </p>
        </div>

        <p className="mt-8 text-center text-[11px] text-zinc-600">
          NetCraft AI v1.0 — Network infrastructure, automated.
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1S8.7 6 12 6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.6 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12S6.8 21.5 12 21.5c6.9 0 9.5-4.8 9.5-7.3 0-.5 0-.9-.1-1.3H12z"
      />
    </svg>
  );
}
