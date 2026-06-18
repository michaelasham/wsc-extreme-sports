"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { PageShell } from "@/components/PageShell";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <PageShell variant="cinematic">
      <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center">
        <div className="glass-card w-full max-w-sm p-8">
          <h1 className="mb-2 text-center text-2xl font-black text-white">
            Staff Login
          </h1>
          <p className="mb-8 text-center text-sm text-white/50">
            WSC Extreme Sports · Staff Access
          </p>

          <form action={action} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoFocus
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none ring-orange-400/50 focus:ring-2"
                placeholder="Enter staff password"
              />
            </div>

            {state?.error && (
              <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="btn-primary w-full disabled:opacity-60"
            >
              {pending ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </PageShell>
  );
}
