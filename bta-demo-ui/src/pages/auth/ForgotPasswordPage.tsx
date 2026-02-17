import { Link } from '@tanstack/react-router'

export function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-background-light text-slate-900 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Account Recovery</p>
          <h2 className="text-2xl font-semibold">Reset your password</h2>
          <p className="text-sm text-slate-500">
            Enter the email you use for BuildFlow and we will send a reset link.
          </p>
        </div>

        <form className="mt-8 space-y-5">
          <label className="block text-sm font-medium text-slate-700">
            Email address
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:ring-primary"
              type="email"
              placeholder="you@company.com"
            />
          </label>
          <button className="btn w-full bg-primary text-white hover:bg-primary/90">Send reset link</button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Back to sign in
          </Link>
          <Link to="/register" className="text-slate-400 hover:text-slate-600">
            Create account
          </Link>
        </div>
      </div>
    </div>
  )
}
