import { Link } from '@tanstack/react-router'

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl font-bold text-primary tracking-tighter">404</p>
        <h1 className="mt-4 text-2xl font-semibold text-base-content">
          Blueprint not found
        </h1>
        <p className="mt-2 text-base-content/70">
          This page isn’t on the job site. Maybe the address changed or the link is outdated.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="btn btn-primary"
          >
            Back to dashboard
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="btn btn-outline btn-primary"
          >
            Go back
          </button>
        </div>
        <p className="mt-10 text-sm text-base-content/50">
          Error code: 404 — Page not found
        </p>
      </div>
    </div>
  )
}
