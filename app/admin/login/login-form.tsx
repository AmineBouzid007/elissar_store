"use client"

import { useActionState } from "react"
import { loginAction, type FormState } from "@/app/admin/actions"

const input = "w-full rounded-lg border border-foreground/10 bg-foreground/5 px-3.5 py-3 text-sm text-foreground outline-none placeholder:text-foreground/30 focus:border-foreground/40"

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(loginAction, {})
  return (
    <form action={action} className="mt-8 space-y-4 rounded-xl border border-foreground/10 bg-card p-6">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs text-foreground/50">Email</label>
        <input id="email" name="email" type="email" required autoComplete="username" defaultValue={state.email} className={input} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs text-foreground/50">Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className={input} />
      </div>
      {state.error && <p role="alert" className="text-sm text-red-400">{state.error}</p>}
      <button disabled={pending} className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  )
}
