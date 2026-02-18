import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { register } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'
import type { ApiError } from '../../api/client'
import { normalizeIsCompanyAdmin } from '../../auth/sessionUtils'

export function RegisterPage() {
  const { setToken, setTokens, setUser } = useAuthStore()
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [company, setCompany] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)

  const [firstNameError, setFirstNameError] = useState<string | null>(null)
  const [lastNameError, setLastNameError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null)
  const [companyError, setCompanyError] = useState<string | null>(null)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [termsAcceptedError, setTermsAcceptedError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)


  const validName = (value: string): string | null => {
    if (!value) return 'Name is required'
    if (value.length < 2) return 'Name must be at least 2 characters long'
    if (value.length > 50) return 'Name must be less than 50 characters long'
    if (!/^[a-zA-Z]+$/.test(value)) return 'Name must contain only letters'
    return null
  }

  const validateEmail = (value: string): string | null => {
    if (!value) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address'
    if (value.length < 5 || value.length > 100) return 'Email must be between 5 and 100 characters long'
    return null
  }

  const validatePassword = (value: string): string | null => {
    if (!value) return 'Password is required'
    if (value.length < 8) return 'Password must be at least 8 characters long'
    if (value.length > 100) return 'Password must be less than 100 characters long'
    if (!/^[a-zA-Z0-9]+$/.test(value)) return 'Password must contain only letters and numbers'
    return null
  }

  const runValidation = (): boolean => {
    const fn = validName(firstName)
    const ln = validName(lastName)
    const e = validateEmail(email)
    const p = validatePassword(password)
    let cp = validatePassword(confirmPassword)
    const cn = validName(company)

    if (cp !== null) {
      cp = password === confirmPassword ? null : 'Passwords do not match'
    }

    setFirstNameError(fn)
    setLastNameError(ln)
    setEmailError(e)
    setPasswordError(p)
    setConfirmPasswordError(cp)
    setCompanyError(cn)
    setTermsAcceptedError(termsAccepted ? null : 'Terms of Service and Privacy Policy must be accepted')
    setGeneralError(null)
    return fn == null && ln == null && e == null && p == null && cp == null && cn == null && termsAccepted
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!runValidation()) return

    setIsSubmitting(true)
    setGeneralError(null)
    try {
      const res = await register({ firstName, lastName, email, password, company })
      const data = res as {
        userId: string
        email: string
        firstName: string
        lastName: string
        company: string
        organizationId?: string
        organizationName?: string
        isCompanyAdmin?: boolean
        token?: string
        accessToken?: string
        access_token?: string
        refreshToken?: string
        refresh_token?: string
      }
      const accessToken = data?.token ?? data?.accessToken ?? data?.access_token
      const refreshToken = data?.refreshToken ?? data?.refresh_token
      if (data?.userId && accessToken) {
        if (refreshToken) {
          setTokens(accessToken, refreshToken)
        } else {
          setToken(accessToken, false)
        }
        setUser({
          userId: data.userId,
          firstName: data.firstName,
          lastName: data.lastName,
          company: data.company,
          organizationId: data.organizationId,
          organizationName: data.organizationName,
          isCompanyAdmin: normalizeIsCompanyAdmin(data.isCompanyAdmin),
        })
        navigate({ to: '/app/dashboard' })
      } else {
        setGeneralError('Registration failed. Please try again.')
      }
    } catch (err: unknown) {
      const apiErr = err as ApiError
      if (apiErr?.status === 400) {
        setGeneralError(apiErr.message)
      } else {
        setGeneralError('Something went wrong. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-5xl grid lg:grid-cols-[0.9fr_1.1fr] gap-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Create your account</h2>
            <p className="text-sm">
              Start tracking your leads, estimates, and jobs in one place.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="grid sm:grid-cols-2 gap-4 mb-0">
              <label>
                First name
                <input
                  className="input bg-background-light text-background-dark mt-2 w-full"
                  type="text"
                  placeholder="Alex"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                {firstNameError && <div className="text-red-500">{firstNameError}</div>}
              </label>
              <label>
                Last name
                <input
                  className="input bg-background-light text-background-dark mt-2 w-full"
                  type="text"
                  placeholder="Henderson"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
                {lastNameError && <div className="text-red-500">{lastNameError}</div>}
              </label>
            </div>
            <label>
              Work email
              <input
                className="input bg-background-light text-background-dark mt-2 w-full"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {emailError && <div className="text-red-500">{emailError}</div>}
            </label>
            <label>
              Company name
              <input
                className="input bg-background-light text-background-dark mt-2 w-full"
                type="text"
                placeholder="Horizon Construction"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
              {companyError && <div className="text-red-500">{companyError}</div>}
            </label>
            <div className="grid sm:grid-cols-2 gap-4">
              <label>
                Password
                <input
                  className="input bg-background-light text-background-dark mt-2 w-full"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {passwordError && <div className="text-red-500">{passwordError}</div>}
              </label>
              <label>
                Confirm password
                <input
                  className="input bg-background-light text-background-dark mt-2 w-full"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                {confirmPasswordError && <div className="text-red-500">{confirmPasswordError}</div>}
              </label>
            </div>
            {generalError && <div className="text-red-500">{generalError}</div>}
            <label className="flex items-center gap-2 text-xs">
              <input className="checkbox checkbox-sm border-primary text-primary" type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} required />
              I agree to the Terms of Service and Privacy Policy.
            </label>
            {termsAcceptedError && <div className="text-red-500">{termsAcceptedError}</div>}
            <button className="btn w-full bg-primary text-white hover:bg-primary/90" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Creating account…
                </>
              ) : 'Create account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </div>

        <div className="hidden lg:flex flex-col justify-between rounded-3xl bg-linear-to-br from-white via-slate-50 to-slate-100 border border-slate-200 p-10">
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
