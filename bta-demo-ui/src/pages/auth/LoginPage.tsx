import { Link } from '@tanstack/react-router'

export function LoginPage() {
  return (
    <div className="min-h-screen bg-background-light text-slate-900 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-4xl grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
        <div className="hidden lg:flex flex-col justify-between rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-10">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Contractor Ops</p>
            <h1 className="mt-4 text-3xl font-semibold">Welcome back to BuildFlow</h1>
            <p className="mt-3 text-sm text-slate-300">
              Keep your pipeline, jobs, and invoices moving with the ops dashboard built for trades.
            </p>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Today</p>
              <p className="text-2xl font-semibold">$184.2k</p>
              <p className="text-xs text-slate-400">Revenue closed this month</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              12 new leads routed overnight
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Sign in</h2>
            <p className="text-sm text-slate-500">Use your ops credentials to continue.</p>
          </div>

          <form className="mt-8 space-y-5">
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:ring-primary"
                type="email"
                placeholder="you@company.com"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Password
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:ring-primary"
                type="password"
                placeholder="••••••••"
              />
            </label>
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-500">
                <input className="checkbox checkbox-sm border-slate-300" type="checkbox" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <button className="btn w-full bg-primary text-white hover:bg-primary/90">Sign in</button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Need an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
