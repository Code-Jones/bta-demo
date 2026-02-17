import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createLead, getLead, updateLead } from '../../api/leads'
import { companiesQueryOptions } from '../../api/companies'
import { queryKeys } from '../../api/queryKeys'
import type { ApiError, CreateLeadRequest, UpdateLeadRequest } from '../../api'

type LeadFormState = {
  name: string
  company: string
  companyId: string
  email: string
  phone: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  leadSource: string
  projectType: string
  estimatedValue: string
  notes: string
  taxLines: TaxLineForm[]
}

type TaxLineForm = {
  id: string
  label: string
  rate: string
}

const leadSourceOptions = ['Referral', 'Website', 'Google', 'Facebook', 'Partner', 'Other']
const projectTypeOptions = ['General', 'HVAC', 'Electrical', 'Plumbing', 'Roofing', 'Other']

type LeadCreateModalProps = {
  isOpen: boolean
  onClose: () => void
  leadId?: string
  initialData?: Partial<LeadFormState>
}

const emptyForm: LeadFormState = {
  name: '',
  company: '',
  companyId: '',
  email: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  leadSource: '',
  projectType: '',
  estimatedValue: '',
  notes: '',
  taxLines: [],
}

export function LeadCreateModal({ isOpen, onClose, leadId, initialData }: LeadCreateModalProps) {
  const modalRef = useRef<HTMLDialogElement | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [form, setForm] = useState<LeadFormState>(emptyForm)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const queryClient = useQueryClient()
  const isEditing = Boolean(leadId)
  const companiesQuery = useQuery(companiesQueryOptions(isEditing))
  const leadQuery = useQuery({
    queryKey: queryKeys.leads.detail(leadId ?? ''),
    queryFn: () => getLead(leadId ?? ''),
    enabled: isOpen && Boolean(leadId),
  })
  const createLeadMutation = useMutation({
    mutationFn: createLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.scoreboard() })
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.list(false) })
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.list(true) })
      queryClient.invalidateQueries({ queryKey: queryKeys.estimates.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.list() })
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.pipeline.board() })
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.list(false) })
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.list(true) })
    },
  })
  const updateLeadMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateLeadRequest }) => updateLead(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.scoreboard() })
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.list(false) })
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.list(true) })
      queryClient.invalidateQueries({ queryKey: queryKeys.pipeline.board() })
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.list(false) })
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.list(true) })
    },
  })

  const validation = useMemo(() => {
    const errors: Record<string, string> = {}
    const trimmedName = form.name.trim()
    if (!trimmedName) errors.name = 'Name is required.'
    if (trimmedName && trimmedName.length < 2) errors.name = 'Name must be at least 2 characters.'

    const email = form.email.trim()
    const phone = form.phone.trim()
    const hasContact = Boolean(email) || Boolean(phone)
    if (!hasContact) errors.contact = 'Add at least an email or phone number.'
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Enter a valid email address.'
    }
    if (phone && !/^[0-9+()\-\s]{7,20}$/.test(phone)) {
      errors.phone = 'Enter a valid phone number.'
    }

    const postalCode = form.postalCode.trim()
    if (postalCode && !/^[A-Za-z0-9\-\s]{3,10}$/.test(postalCode)) {
      errors.postalCode = 'Enter a valid postal code.'
    }

    const estimatedValue = form.estimatedValue.trim()
    if (estimatedValue) {
      const parsed = Number(estimatedValue)
      if (Number.isNaN(parsed) || parsed < 0) {
        errors.estimatedValue = 'Enter a valid amount.'
      }
    }

    const taxLineErrors = form.taxLines.map((line) => {
      const label = line.label.trim()
      const rateValue = line.rate.trim()
      if (!label && !rateValue) return ''
      if (!label) return 'Add a label.'
      const parsedRate = Number(rateValue)
      if (!rateValue || Number.isNaN(parsedRate) || parsedRate < 0) return 'Enter a valid rate.'
      return ''
    })
    if (taxLineErrors.some(Boolean)) errors.taxLines = 'Fix tax line entries.'

    return {
      errors,
      isValid: Object.keys(errors).length === 0,
      taxLineErrors,
    }
  }, [form])

  useEffect(() => {
    const dialog = modalRef.current
    if (!dialog) return

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal()
      }
      queueMicrotask(() => {
        setSubmitError(null)
        setTouched({})
        if (!isEditing) {
          setForm({ ...emptyForm, ...initialData })
        }
      })
    } else if (dialog.open) {
      dialog.close()
    }
  }, [isOpen, isEditing, initialData])

  useEffect(() => {
    if (!leadQuery.data) return
    const data = leadQuery.data
    queueMicrotask(() => {
      setForm({
        name: data.name ?? '',
        company: data.company ?? '',
        companyId: data.companyId ?? '',
        email: data.email ?? '',
        phone: data.phone ?? '',
        addressLine1: data.addressLine1 ?? '',
        addressLine2: data.addressLine2 ?? '',
        city: data.city ?? '',
        state: data.state ?? '',
        postalCode: data.postalCode ?? '',
        leadSource: data.leadSource ?? '',
        projectType: data.projectType ?? '',
        estimatedValue:
          data.estimatedValue !== null && data.estimatedValue !== undefined
            ? String(data.estimatedValue)
            : '',
        notes: data.notes ?? '',
        taxLines: (data.taxLines ?? []).map((line) => ({
          id: line.id,
          label: line.label,
          rate: String(line.rate),
        })),
      })
    })
  }, [leadQuery.data])

  const handleClose = () => {
    modalRef.current?.close()
    setSubmitError(null)
    setTouched({})
    onClose()
  }

  const handleChange =
    (field: keyof LeadFormState) =>
      (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({ ...prev, [field]: event.target.value }))
      }

  const handleTaxLineChange =
    (id: string, field: keyof TaxLineForm) => (event: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({
        ...prev,
        taxLines: prev.taxLines.map((line) =>
          line.id === id ? { ...line, [field]: event.target.value } : line,
        ),
      }))
      setTouched((prev) => ({ ...prev, taxLines: true }))
    }

  const addTaxLine = () => {
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now())
    setForm((prev) => ({
      ...prev,
      taxLines: [...prev.taxLines, { id, label: '', rate: '' }],
    }))
  }

  const removeTaxLine = (id: string) => {
    setForm((prev) => ({
      ...prev,
      taxLines: prev.taxLines.filter((line) => line.id !== id),
    }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitError(null)
    setTouched({
      name: true,
      email: true,
      phone: true,
      contact: true,
      postalCode: true,
      estimatedValue: true,
      taxLines: true,
    })

    if (!validation.isValid) return

    try {
      if (isEditing && leadId) {
        const selectedCompanyId = form.companyId.trim()
        const companyName = form.company.trim()
        const payload: UpdateLeadRequest = {
          name: form.name.trim(),
          company: selectedCompanyId ? null : companyName || null,
          companyId: selectedCompanyId || null,
          email: form.email.trim(),
          phone: form.phone.trim(),
          addressLine1: form.addressLine1.trim(),
          addressLine2: form.addressLine2.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          postalCode: form.postalCode.trim(),
          leadSource: form.leadSource,
          projectType: form.projectType,
          estimatedValue: form.estimatedValue ? Number(form.estimatedValue) : null,
          notes: form.notes.trim(),
          taxLines: form.taxLines
            .filter((line) => line.label.trim() || line.rate.trim())
            .map((line) => ({
              label: line.label.trim(),
              rate: Number(line.rate),
            })),
        }
        await updateLeadMutation.mutateAsync({ id: leadId, payload })
        handleClose()
      } else {
        const selectedCompanyId = form.companyId.trim()
        const companyName = form.company.trim()
        const payload: CreateLeadRequest = {
          name: form.name.trim(),
          company: selectedCompanyId ? undefined : companyName || undefined,
          companyId: selectedCompanyId || undefined,
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
          addressLine1: form.addressLine1.trim() || undefined,
          addressLine2: form.addressLine2.trim() || undefined,
          city: form.city.trim() || undefined,
          state: form.state.trim() || undefined,
          postalCode: form.postalCode.trim() || undefined,
          leadSource: form.leadSource || undefined,
          projectType: form.projectType || undefined,
          estimatedValue: form.estimatedValue ? Number(form.estimatedValue) : undefined,
          notes: form.notes.trim() || undefined,
          taxLines: form.taxLines
            .filter((line) => line.label.trim() || line.rate.trim())
            .map((line) => ({
              label: line.label.trim(),
              rate: Number(line.rate),
            })),
        }
        await createLeadMutation.mutateAsync(payload)
        setForm(emptyForm)
        handleClose()
      }
    } catch (error) {
      const apiError = error as ApiError
      setSubmitError(
        apiError?.message ||
        (isEditing ? 'Unable to update the lead. Try again.' : 'Unable to create the lead. Try again.')
      )
    }
  }

  return (
    <dialog className="modal" ref={modalRef}>
      <div className="modal-box max-w-2xl p-0 overflow-hidden overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div>
            <h3 className="text-lg font-bold">{isEditing ? 'Edit Lead' : 'New Lead'}</h3>
            <p className="text-xs text-slate-500">
              {isEditing ? 'Update lead details and keep the record current.' : 'Capture contact details and project intent.'}
            </p>
          </div>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={handleClose} type="button">
            <span className="material-icons text-slate-500">close</span>
          </button>
        </div>
        <form className="p-6 space-y-6" onSubmit={handleSubmit}>
          {leadQuery.isLoading && isEditing ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              Loading lead details...
            </div>
          ) : null}
          {leadQuery.isError && isEditing ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {leadQuery.error?.message || 'Unable to load lead details.'}
            </div>
          ) : null}
          {submitError ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {submitError}
            </div>
          ) : null}

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
              <span className="material-icons text-sm">person</span>
              Lead Information
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Full Name</label>
                <input
                  className="input input-bordered w-full"
                  value={form.name}
                  onChange={handleChange('name')}
                  onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                  placeholder="Jordan Smith"
                />
                {touched.name && validation.errors.name ? (
                  <p className="text-xs text-rose-600">{validation.errors.name}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Company</label>
                <select
                  className="select select-bordered w-full"
                  value={form.companyId}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      companyId: event.target.value,
                      company: event.target.value ? '' : prev.company,
                    }))
                  }
                >
                  <option value="">Add new company</option>
                  {(companiesQuery.data ?? []).map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
                <input
                  className="input input-bordered w-full"
                  value={form.company}
                  onChange={handleChange('company')}
                  placeholder="Apex Construction"
                  disabled={Boolean(form.companyId)}
                />
                {companiesQuery.isError ? (
                  <p className="text-xs text-rose-600">Unable to load companies. Try again later.</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Email</label>
                <input
                  className="input input-bordered w-full"
                  value={form.email}
                  onChange={handleChange('email')}
                  onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                  placeholder="jordan@email.com"
                  type="email"
                />
                {touched.email && validation.errors.email ? (
                  <p className="text-xs text-rose-600">{validation.errors.email}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Phone</label>
                <input
                  className="input input-bordered w-full"
                  value={form.phone}
                  onChange={handleChange('phone')}
                  onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                  placeholder="(555) 555-0234"
                  type="tel"
                />
                {touched.phone && validation.errors.phone ? (
                  <p className="text-xs text-rose-600">{validation.errors.phone}</p>
                ) : null}
              </div>
            </div>
            {touched.contact && validation.errors.contact ? (
              <p className="text-xs text-rose-600">{validation.errors.contact}</p>
            ) : null}
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
              <span className="material-icons text-sm">business_center</span>
              Project Details
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Project Type</label>
                <select
                  className="select select-bordered w-full"
                  value={form.projectType}
                  onChange={handleChange('projectType')}
                >
                  <option value="">Select project type</option>
                  {projectTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Lead Source</label>
                <select
                  className="select select-bordered w-full"
                  value={form.leadSource}
                  onChange={handleChange('leadSource')}
                >
                  <option value="">Select lead source</option>
                  {leadSourceOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Estimated Value</label>
                <input
                  className="input input-bordered w-full"
                  value={form.estimatedValue}
                  onChange={handleChange('estimatedValue')}
                  onBlur={() => setTouched((prev) => ({ ...prev, estimatedValue: true }))}
                  placeholder="$00.00"
                  inputMode="decimal"
                />
                {touched.estimatedValue && validation.errors.estimatedValue ? (
                  <p className="text-xs text-rose-600">{validation.errors.estimatedValue}</p>
                ) : null}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
              <span className="material-icons text-sm">location_on</span>
              Site Address
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold text-slate-600">Address Line 1</label>
                <input
                  className="input input-bordered w-full"
                  value={form.addressLine1}
                  onChange={handleChange('addressLine1')}
                  placeholder="123 Main Street"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold text-slate-600">Address Line 2</label>
                <input
                  className="input input-bordered w-full"
                  value={form.addressLine2}
                  onChange={handleChange('addressLine2')}
                  placeholder="Apt. 200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">City</label>
                <input
                  className="input input-bordered w-full"
                  value={form.city}
                  onChange={handleChange('city')}
                  placeholder="Calgary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Province/State</label>
                <input
                  className="input input-bordered w-full"
                  value={form.state}
                  onChange={handleChange('state')}
                  placeholder="Alberta"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Postal Code/Zip Code</label>
                <input
                  className="input input-bordered w-full"
                  value={form.postalCode}
                  onChange={handleChange('postalCode')}
                  onBlur={() => setTouched((prev) => ({ ...prev, postalCode: true }))}
                  placeholder="T5K 0N1"
                />
                {touched.postalCode && validation.errors.postalCode ? (
                  <p className="text-xs text-rose-600">{validation.errors.postalCode}</p>
                ) : null}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
              <span className="material-icons text-sm">receipt_long</span>
              Tax Lines
            </div>
            <div className="space-y-3">
              {form.taxLines.length === 0 ? (
                <p className="text-xs text-slate-500">No tax lines added yet.</p>
              ) : (
                form.taxLines.map((line, index) => (
                  <div key={line.id} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-3 items-start">
                    <div className="space-y-1">
                      <input
                        className="input input-bordered w-full"
                        value={line.label}
                        onChange={handleTaxLineChange(line.id, 'label')}
                        placeholder="Tax label (e.g. State Tax)"
                      />
                      {touched.taxLines && validation.taxLineErrors[index] ? (
                        <p className="text-xs text-rose-600">{validation.taxLineErrors[index]}</p>
                      ) : null}
                    </div>
                    <div className="space-y-1">
                      <div className="relative">
                        <input
                          className="input input-bordered w-full pr-8"
                          value={line.rate}
                          onChange={handleTaxLineChange(line.id, 'rate')}
                          placeholder="0.00"
                          inputMode="decimal"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
                      </div>
                    </div>
                    <button
                      className="btn btn-ghost btn-sm text-rose-600"
                      type="button"
                      onClick={() => removeTaxLine(line.id)}
                    >
                      <span className="material-icons text-sm">close</span>
                    </button>
                  </div>
                ))
              )}
            </div>
            <button className="btn btn-sm btn-outline" type="button" onClick={addTaxLine}>
              <span className="material-icons text-sm">add</span>
              Add tax line
            </button>
            {touched.taxLines && validation.errors.taxLines ? (
              <p className="text-xs text-rose-600">{validation.errors.taxLines}</p>
            ) : null}
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
              <span className="material-icons text-sm">notes</span>
              Notes
            </div>
            <textarea
              className="textarea textarea-bordered w-full min-h-[110px]"
              value={form.notes}
              onChange={handleChange('notes')}
              placeholder="Add any requirements, special instructions, or preferences."
            />
          </section>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-200 pt-4">
            <p className="text-xs text-slate-500">
              Fields marked are optional unless stated. You can refine details later.
            </p>
            <div className="flex items-center gap-3">
              <button
                className="btn btn-ghost"
                onClick={handleClose}
                type="button"
                disabled={createLeadMutation.isPending || updateLeadMutation.isPending}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                type="submit"
                disabled={createLeadMutation.isPending || updateLeadMutation.isPending || (isEditing && leadQuery.isLoading)}
              >
                {createLeadMutation.isPending || updateLeadMutation.isPending
                  ? 'Saving...'
                  : isEditing
                    ? 'Save Changes'
                    : 'Create Lead'}
              </button>
            </div>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={handleClose}>
        <button aria-label="Close">close</button>
      </form>
    </dialog>
  )
}
