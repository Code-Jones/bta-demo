import { Link } from '@tanstack/react-router'

export function RegisterPage() {
  return (
    <div className="min-h-screen bg-background-light text-slate-900 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-5xl grid lg:grid-cols-[0.9fr_1.1fr] gap-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Create your account</h2>
            <p className="text-sm text-slate-500">
              Start tracking your leads, estimates, and jobs in one place.
            </p>
          </div>

          <form className="mt-8 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block text-sm font-medium text-slate-700">
                First name
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:ring-primary"
                  type="text"
                  placeholder="Alex"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Last name
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:ring-primary"
                  type="text"
                  placeholder="Henderson"
                />
              </label>
            </div>
            <label className="block text-sm font-medium text-slate-700">
              Work email
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:ring-primary"
                type="email"
                placeholder="you@company.com"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Company name
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:ring-primary"
                type="text"
                placeholder="Horizon Construction"
              />
            </label>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block text-sm font-medium text-slate-700">
                Password
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:ring-primary"
                  type="password"
                  placeholder="••••••••"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Confirm password
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:ring-primary"
                  type="password"
                  placeholder="••••••••"
                />
              </label>
            </div>
            <label className="flex items-start gap-2 text-xs text-slate-500">
              <input className="checkbox checkbox-sm border-slate-300 mt-0.5" type="checkbox" />
              I agree to the Terms of Service and Privacy Policy.
            </label>
            <button className="btn w-full bg-primary text-white hover:bg-primary/90">Create account</button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </div>

        <div className="hidden lg:flex flex-col justify-between rounded-3xl bg-gradient-to-br from-white via-slate-50 to-slate-100 border border-slate-200 p-10">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Why BuildFlow</p>
            <h3 className="mt-4 text-2xl font-semibold">All your ops, one command center.</h3>
            <p className="mt-3 text-sm text-slate-500">
              Stay on top of leads, quotes, jobs, and payments with a pipeline built for contractors.
            </p>
          </div>
          <div className="space-y-4">
            <FeatureRow title="Scoreboard" description="Daily metrics that keep your team aligned." />
            <FeatureRow title="Pipeline" description="Track every estimate from draft to paid." />
            <FeatureRow title="Automation" description="Keep follow-ups moving without manual work." />
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureRow({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="text-xs text-slate-500 mt-1">{description}</p>
    </div>
  )
}
