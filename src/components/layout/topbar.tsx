import Image from "next/image";
import { Search, Bell } from "lucide-react";
import { auth, signOut } from "@/lib/auth";

export async function Topbar() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-zinc-800 bg-zinc-950/80 px-4 backdrop-blur">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          type="search"
          placeholder="Search projects, devices…"
          className="h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 pl-9 pr-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium text-zinc-100">
                {user.name ?? user.email}
              </div>
              <div className="text-xs text-zinc-500">{user.email}</div>
            </div>
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name ?? "User"}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full border border-zinc-800"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-xs font-medium text-zinc-300">
                {(user.name ?? user.email ?? "?").charAt(0).toUpperCase()}
              </div>
            )}
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
              >
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <a
            href="/login"
            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500"
          >
            Sign in
          </a>
        )}
      </div>
    </header>
  );
}
