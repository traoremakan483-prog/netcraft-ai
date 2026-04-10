import { auth } from "@/lib/auth";

export default async function SettingsPage() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-zinc-500">
          Settings
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50">
          Account
        </h1>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-sm font-semibold text-zinc-100">Profile</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Name</dt>
            <dd className="text-zinc-200">{user?.name ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Email</dt>
            <dd className="font-mono text-zinc-200">{user?.email ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">User ID</dt>
            <dd className="font-mono text-xs text-zinc-400">
              {user?.id ?? "—"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
