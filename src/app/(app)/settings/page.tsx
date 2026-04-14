import { auth, signOut } from "@/lib/auth";
import { LogOut, User, Mail, Fingerprint } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <p className="text-xs uppercase tracking-wider text-zinc-500">
          Settings
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-50">
          Account
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Manage your profile and session.
        </p>
      </div>

      {/* Profile card */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur">
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
        <h2 className="relative text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Profile
        </h2>
        <dl className="relative mt-6 space-y-5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 ring-1 ring-blue-500/20">
              <User className="h-5 w-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <dt className="text-xs uppercase tracking-wider text-zinc-500">
                Name
              </dt>
              <dd className="mt-1 text-sm font-medium text-zinc-100">
                {user?.name ?? "—"}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 ring-1 ring-violet-500/20">
              <Mail className="h-5 w-5 text-violet-400" />
            </div>
            <div className="flex-1">
              <dt className="text-xs uppercase tracking-wider text-zinc-500">
                Email
              </dt>
              <dd className="mt-1 font-mono text-sm text-zinc-100">
                {user?.email ?? "—"}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 ring-1 ring-emerald-500/20">
              <Fingerprint className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <dt className="text-xs uppercase tracking-wider text-zinc-500">
                User ID
              </dt>
              <dd className="mt-1 font-mono text-xs text-zinc-400">
                {user?.id ?? "—"}
              </dd>
            </div>
          </div>
        </dl>
      </div>

      {/* Session card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Session
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          Sign out of NetCraft AI. You&apos;ll need to sign in again to access
          your projects.
        </p>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
          className="mt-5"
        >
          <button
            type="submit"
            className="group inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-2.5 text-sm font-medium text-rose-300 transition hover:border-rose-500/50 hover:bg-rose-500/20"
          >
            <LogOut className="h-4 w-4 transition group-hover:-translate-x-0.5" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
