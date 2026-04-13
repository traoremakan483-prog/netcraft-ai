import Image from "next/image";
import { Search, Bell } from "lucide-react";
import { auth, signOut } from "@/lib/auth";

export async function Topbar() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-zinc-800/60 bg-zinc-950/70 px-4 pl-14 backdrop-blur-xl md:pl-4">
      {/* Search */}
      <div className="group relative flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-blue-400" />
        <input
          type="search"
          placeholder="Search projects, devices..."
          className="h-9 w-full rounded-lg border border-zinc-800/80 bg-zinc-900/50 pl-9 pr-3 text-sm text-zinc-200 placeholder:text-zinc-600 transition-all duration-200 focus:border-blue-500/50 focus:bg-zinc-900/80 focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:shadow-lg focus:shadow-blue-500/5"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition-all duration-200 hover:bg-zinc-800/60 hover:text-zinc-200"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
        </button>

        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium text-zinc-100">
                {user.name ?? user.email}
              </div>
              <div className="text-[11px] text-zinc-500">{user.email}</div>
            </div>
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name ?? "User"}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full border-2 border-zinc-800 ring-2 ring-zinc-950 transition-all hover:border-blue-500/50"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-xs font-bold text-white shadow-md shadow-blue-500/20">
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
                className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-200"
              >
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <a
            href="/login"
            className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition-all duration-200 hover:shadow-blue-500/40 hover:brightness-110"
          >
            Sign in
          </a>
        )}
      </div>
    </header>
  );
}
