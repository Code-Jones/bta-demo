import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { login } from '../../api/auth'
import type { ApiError } from '../../api/client'
import { useAuthStore } from '../../store/authStore'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateEmail(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return 'Email is required'
  if (!EMAIL_REGEX.test(trimmed)) return 'Please enter a valid email address'
  return null
}

function validatePassword(value: string): string | null {
  if (!value) return 'Password is required'
  return null
}

export function LoginPage() {
  const { setToken, setTokens } = useAuthStore()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const runValidation = (): boolean => {
    const e = validateEmail(email)
    const p = validatePassword(password)
    setEmailError(e)
    setPasswordError(p)
    setGeneralError(null)
    return e == null && p == null
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!runValidation()) return

    setIsSubmitting(true)
    setGeneralError(null)
    try {
      const res = await login({ email: email.trim(), password })
      const data = res as { token?: string; accessToken?: string; access_token?: string; refreshToken?: string; refresh_token?: string }
      const accessToken = data?.token ?? data?.accessToken ?? data?.access_token
      const refreshToken = data?.refreshToken ?? data?.refresh_token
      if (accessToken) {
        if (refreshToken) {
          setTokens(accessToken, refreshToken)
        } else {
          setToken(accessToken, false)
        }
        navigate({ to: '/app/dashboard' })
      } else {
        setGeneralError('Sign in failed. Please try again.')
      }
    } catch (err) {
      const apiErr = err as ApiError
      if (apiErr?.status === 401) {
        setGeneralError('Invalid email or password. Please try again.')
      } else if (apiErr?.message) {
        setGeneralError(apiErr.message)
      } else {
        setGeneralError('Something went wrong. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const clearEmailError = () => {
    if (emailError) setEmailError(null)
    if (generalError) setGeneralError(null)
  }
  const clearPasswordError = () => {
    if (passwordError) setPasswordError(null)
    if (generalError) setGeneralError(null)
  }

  return (
    <div className="min-h-screen bg-background-light text-slate-900 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-4xl grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
        <div className="hidden lg:flex flex-col justify-between rounded-3xl bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-10">
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
            <p className="text-sm text-slate-500">Use your work email and password to continue.</p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
            {generalError && (
              <div role="alert" className="alert alert-error">
                <span>{generalError}</span>
              </div>
            )}

            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                className={`mt-2 w-full rounded-xl border px-4 py-2.5 text-sm focus:ring-primary ${emailError ? 'input-error border-error' : 'border-slate-200 focus:border-primary'}`}
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearEmailError() }}
                onBlur={() => setEmailError(validateEmail(email))}
                autoComplete="email"
                aria-invalid={!!emailError}
                aria-describedby={emailError ? 'email-error' : undefined}
              />
              {emailError && (
                <p id="email-error" className="mt-1 text-sm text-error">{emailError}</p>
              )}
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Password
              <input
                className={`mt-2 w-full rounded-xl border px-4 py-2.5 text-sm focus:ring-primary ${passwordError ? 'input-error border-error' : 'border-slate-200 focus:border-primary'}`}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearPasswordError() }}
                onBlur={() => setPasswordError(validatePassword(password))}
                autoComplete="current-password"
                aria-invalid={!!passwordError}
                aria-describedby={passwordError ? 'password-error' : undefined}
              />
              {passwordError && (
                <p id="password-error" className="mt-1 text-sm text-error">{passwordError}</p>
              )}
            </label>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-500">
                <input className="checkbox checkbox-sm border-blue-500 text-blue-500" type="checkbox" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <button
              className="btn w-full bg-primary text-white hover:bg-primary/90"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
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
