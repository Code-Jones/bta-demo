import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createCompany, getCompany, updateCompany } from '../../api/companies'
import { queryKeys } from '../../api/queryKeys'
import type { ApiError, CreateCompanyRequest, UpdateCompanyRequest } from '../../api'

type CompanyFormState = {
  name: string
  phone: string
  email: string
  website: string
  notes: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  taxId: string
  taxLines: TaxLineForm[]
}

type TaxLineForm = {
  id: string
  label: string
  rate: string
}

type CompanyModalProps = {
  isOpen: boolean
  onClose: () => void
  companyId?: string
  initialData?: Partial<CompanyFormState>
}

const emptyForm: CompanyFormState = {
  name: '',
  phone: '',
  email: '',
  website: '',
  notes: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  taxId: '',
  taxLines: [],
}

export function CompanyModal({ isOpen, onClose, companyId, initialData }: CompanyModalProps) {
  const modalRef = useRef<HTMLDialogElement | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [form, setForm] = useState<CompanyFormState>(emptyForm)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const queryClient = useQueryClient()
  const isEditing = Boolean(companyId)

  const companyQuery = useQuery({
    queryKey: queryKeys.companies.detail(companyId ?? ''),
    queryFn: () => getCompany(companyId ?? ''),
    enabled: isOpen && Boolean(companyId),
  })

  const createCompanyMutation = useMutation({
    mutationFn: createCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.list(true) })
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.list(false) })
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.list(false) })
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.list(true) })
    },
  })

  const updateCompanyMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCompanyRequest }) => updateCompany(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.list(true) })
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.list(false) })
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.list(false) })
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.list(true) })
    },
  })

  const validation = useMemo(() => {
    const errors: Record<string, string> = {}
    if (!form.name.trim()) errors.name = 'Company name is required.'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Enter a valid email address.'
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
      if (!dialog.open) dialog.showModal()
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
    if (!companyQuery.data) return
    const data = companyQuery.data
    queueMicrotask(() => {
      setForm({
        name: data.name ?? '',
        phone: data.phone ?? '',
        email: data.email ?? '',
        website: data.website ?? '',
        notes: data.notes ?? '',
        addressLine1: data.addressLine1 ?? '',
        addressLine2: data.addressLine2 ?? '',
        city: data.city ?? '',
        state: data.state ?? '',
        postalCode: data.postalCode ?? '',
        taxId: data.taxId ?? '',
        taxLines: (data.taxLines ?? []).map((line) => ({
          id: line.id,
          label: line.label,
          rate: String(line.rate),
        })),
      })
    })
  }, [companyQuery.data])

  const handleClose = () => {
    modalRef.current?.close()
    setSubmitError(null)
    setTouched({})
    onClose()
  }

  const handleChange =
    (field: keyof CompanyFormState) =>
      (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    setTouched({ name: true, email: true, taxLines: true })
    if (!validation.isValid) return

    try {
      if (isEditing && companyId) {
        const payload: UpdateCompanyRequest = {
          name: form.name.trim(),
          phone: form.phone.trim() || null,
          email: form.email.trim() || null,
          website: form.website.trim() || null,
          notes: form.notes.trim() || null,
          addressLine1: form.addressLine1.trim() || null,
          addressLine2: form.addressLine2.trim() || null,
          city: form.city.trim() || null,
          state: form.state.trim() || null,
          postalCode: form.postalCode.trim() || null,
          taxId: form.taxId.trim() || null,
          taxLines: form.taxLines
            .filter((line) => line.label.trim() || line.rate.trim())
            .map((line) => ({
              label: line.label.trim(),
              rate: Number(line.rate),
            })),
        }
        await updateCompanyMutation.mutateAsync({ id: companyId, payload })
      } else {
        const payload: CreateCompanyRequest = {
          name: form.name.trim(),
          phone: form.phone.trim() || undefined,
          email: form.email.trim() || undefined,
          website: form.website.trim() || undefined,
          notes: form.notes.trim() || undefined,
          addressLine1: form.addressLine1.trim() || undefined,
          addressLine2: form.addressLine2.trim() || undefined,
          city: form.city.trim() || undefined,
          state: form.state.trim() || undefined,
          postalCode: form.postalCode.trim() || undefined,
          taxId: form.taxId.trim() || undefined,
          taxLines: form.taxLines
            .filter((line) => line.label.trim() || line.rate.trim())
            .map((line) => ({
              label: line.label.trim(),
              rate: Number(line.rate),
            })),
        }
        await createCompanyMutation.mutateAsync(payload)
      }

      setForm(emptyForm)
      handleClose()
    } catch (error) {
      const apiError = error as ApiError
      setSubmitError(apiError?.message || (isEditing ? 'Unable to update company.' : 'Unable to create company.'))
    }
  }

  return (
    <dialog className="modal" ref={modalRef}>
      <div className="modal-box max-w-2xl p-0 overflow-hidden overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div>
            <h3 className="text-lg font-bold">{isEditing ? 'Edit Company' : 'New Company'}</h3>
            <p className="text-xs text-slate-500">Business details, contacts, and billing metadata.</p>
          </div>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={handleClose} type="button">
            <span className="material-icons text-slate-500">close</span>
          </button>
        </div>
        <form className="p-6 space-y-6" onSubmit={handleSubmit}>
          {companyQuery.isLoading && isEditing ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              Loading company details...
            </div>
          ) : null}
          {companyQuery.isError && isEditing ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {companyQuery.error?.message || 'Unable to load company details.'}
            </div>
          ) : null}
          {submitError ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {submitError}
            </div>
          ) : null}

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
              <span className="material-icons text-sm">domain</span>
              Company Profile
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Company Name</label>
                <input
                  className="input input-bordered w-full"
                  value={form.name}
                  onChange={handleChange('name')}
                  onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                  placeholder="Apex Construction"
                />
                {touched.name && validation.errors.name ? (
                  <p className="text-xs text-rose-600">{validation.errors.name}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Tax ID / GST / EIN</label>
                <input
                  className="input input-bordered w-full"
                  value={form.taxId}
                  onChange={handleChange('taxId')}
                  placeholder="Tax ID"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Email</label>
                <input
                  className="input input-bordered w-full"
                  value={form.email}
                  onChange={handleChange('email')}
                  onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                  placeholder="accounts@company.com"
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
                  placeholder="(555) 555-0199"
                  type="tel"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold text-slate-600">Website</label>
                <input
                  className="input input-bordered w-full"
                  value={form.website}
                  onChange={handleChange('website')}
                  placeholder="https://company.com"
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
              <span className="material-icons text-sm">location_on</span>
              Headquarters
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold text-slate-600">Address Line 1</label>
                <input
                  className="input input-bordered w-full"
                  value={form.addressLine1}
                  onChange={handleChange('addressLine1')}
                  placeholder="123 Market Street"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold text-slate-600">Address Line 2</label>
                <input
                  className="input input-bordered w-full"
                  value={form.addressLine2}
                  onChange={handleChange('addressLine2')}
                  placeholder="Suite 200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">City</label>
                <input className="input input-bordered w-full" value={form.city} onChange={handleChange('city')} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">State</label>
                <input className="input input-bordered w-full" value={form.state} onChange={handleChange('state')} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Postal Code</label>
                <input
                  className="input input-bordered w-full"
                  value={form.postalCode}
                  onChange={handleChange('postalCode')}
                />
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
                        placeholder="Tax label (e.g. City Tax)"
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
              placeholder="Billing instructions, preferred contact, or account notes."
            />
          </section>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-200 pt-4">
            <p className="text-xs text-slate-500">Optional fields help with ops and invoicing accuracy.</p>
            <div className="flex items-center gap-3">
              <button
                className="btn btn-ghost"
                onClick={handleClose}
                type="button"
                disabled={createCompanyMutation.isPending || updateCompanyMutation.isPending}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                type="submit"
                disabled={createCompanyMutation.isPending || updateCompanyMutation.isPending}
              >
                {createCompanyMutation.isPending || updateCompanyMutation.isPending
                  ? 'Saving...'
                  : isEditing
                    ? 'Save Changes'
                    : 'Create Company'}
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
