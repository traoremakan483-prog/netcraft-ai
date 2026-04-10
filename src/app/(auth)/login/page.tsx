import { signIn } from "@/lib/auth";
import { Network } from "lucide-react";

export const dynamic = "force-dynamic";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-600">
            <Network className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-zinc-50">
            NetCraft <span className="text-blue-500">AI</span>
          </span>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h1 className="text-lg font-semibold text-zinc-50">Sign in</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Continue with your Google account to access your projects.
          </p>

          <form
            action={async () => {
              "use server";
              const params = await searchParams;
              await signIn("google", {
                redirectTo: params?.callbackUrl ?? "/dashboard",
              });
            }}
            className="mt-6"
          >
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-md border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-800"
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-zinc-500">
            By signing in you agree to the terms of use.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-600">
          NetCraft AI V1 — dark mode · cockpit feel
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
