import { useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '../AppLayout'
import { Table } from '../../components/table/Table'
import { ConfirmDeleteModal } from '../../components/modals/ConfirmDeleteModal'
import { useAuthStore } from '../../store/authStore'
import { getInitials } from '../../utils'
import { createOrganizationUser, deleteOrganizationUser, organizationUsersQueryOptions } from '../../api/organizationUsers'
import { queryKeys } from '../../api/queryKeys'
import type { ApiError } from '../../api/client'
import type { CreateOrganizationUserRequest } from '../../api/types'

type UserRow = {
  id: string
  name: string
  email: string
  role: string
  isCompanyAdmin: boolean
}

type UserFormState = {
  firstName: string
  lastName: string
  email: string
  password: string
  isCompanyAdmin: boolean
}

const emptyForm: UserFormState = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  isCompanyAdmin: false,
}

const buildUserName = (firstName: string, lastName: string, email: string) => {
  const name = [firstName, lastName].filter(Boolean).join(' ')
  return name || email
}

const getCreatePayload = (form: UserFormState): CreateOrganizationUserRequest | null => {
  const payload: CreateOrganizationUserRequest = {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    email: form.email.trim(),
    password: form.password,
    isCompanyAdmin: form.isCompanyAdmin,
  }

  if (!payload.firstName || !payload.lastName || !payload.email || !payload.password) {
    return null
  }

  return payload
}

const getRoleBadgeClasses = (isAdmin: boolean) =>
  isAdmin ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'

export function OrganizationUsersPage() {
  const modalRef = useRef<HTMLDialogElement | null>(null)
  const queryClient = useQueryClient()
  const authUser = useAuthStore((state) => state.user)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<UserFormState>(emptyForm)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const usersQuery = useQuery(organizationUsersQueryOptions())

  const createUserMutation = useMutation({
    mutationFn: createOrganizationUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizationUsers.list() })
    },
  })

  const isCreating = createUserMutation.isPending

  const deleteUserMutation = useMutation({
    mutationFn: deleteOrganizationUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizationUsers.list() })
    },
  })

  const rows = useMemo<UserRow[]>(() => {
    if (!usersQuery.data) return []
    return usersQuery.data.map((user) => {
      const name = buildUserName(user.firstName, user.lastName, user.email)
      return {
        id: user.id,
        name,
        email: user.email,
        role: user.isCompanyAdmin ? 'Admin' : 'Member',
        isCompanyAdmin: user.isCompanyAdmin,
      }
    })
  }, [usersQuery.data])

  const handleOpen = () => {
    setSubmitError(null)
    setForm(emptyForm)
    queueMicrotask(() => modalRef.current?.showModal())
  }

  const handleClose = () => {
    modalRef.current?.close()
    setSubmitError(null)
  }

  const handleFieldChange = (field: keyof UserFormState) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = field === 'isCompanyAdmin'
        ? (event.target as HTMLInputElement).checked
        : event.target.value
      setForm((prev) => ({ ...prev, [field]: value }))
    }

  const handleCreateUser = async () => {
    setSubmitError(null)
    const payload = getCreatePayload(form)
    if (!payload) {
      setSubmitError('All fields are required.')
      return
    }

    try {
      await createUserMutation.mutateAsync(payload)
      handleClose()
    } catch (error) {
      const apiError = error as ApiError
      setSubmitError(apiError?.message || 'Unable to add user. Try again.')
    }
  }

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return
    try {
      await deleteUserMutation.mutateAsync(confirmDeleteId)
    } catch {
      // handled by mutation error state
    } finally {
      setConfirmDeleteId(null)
    }
  }

  const organizationName = authUser?.organizationName ?? authUser?.company ?? 'Your Organization'
  const currentUserId = authUser?.userId
  const isCurrentUser = (id: string) => id === currentUserId

  const modals = [
    <ConfirmDeleteModal
      isOpen={Boolean(confirmDeleteId)}
      title="Remove user"
      description="This will permanently remove the user from your company account."
      confirmLabel="Remove"
      onCancel={() => setConfirmDeleteId(null)}
      onConfirm={handleConfirmDelete}
    />,
  ]

  return (
    <AppLayout modals={modals}>
      <div className="flex min-h-screen">
        <main className="flex-1 p-8">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Company Admin</p>
              <h1 className="text-2xl font-bold">Company Users</h1>
              <p className="text-slate-500 text-sm">Manage access for {organizationName}.</p>
            </div>
            <button
              className="btn btn-sm bg-primary text-white hover:bg-primary/90"
              onClick={handleOpen}
            >
              <span className="material-icons text-sm">person_add</span>
              Add User
            </button>
          </header>

          <Table
            rows={rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center">
                      {getInitials(row.name, 'US')}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{row.name}</p>
                      <p className="text-xs text-slate-500">{row.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClasses(row.isCompanyAdmin)}`}
                  >
                    {row.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    className="btn btn-ghost btn-sm text-rose-600"
                    onClick={() => setConfirmDeleteId(row.id)}
                    disabled={isCurrentUser(row.id)}
                      title={isCurrentUser(row.id) ? 'You cannot remove yourself' : 'Remove user'}
                    >
                    <span className="material-icons text-sm">delete</span>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            rowSortValues={rows.map((row) => ({
              name: row.name,
              role: row.role,
              email: row.email,
            }))}
            loadingMessage="Loading users..."
            isLoading={usersQuery.isLoading}
            isError={usersQuery.isError}
            errorMessage={usersQuery.error?.message || 'Unable to load users.'}
            emptyMessage="No users yet. Add your first teammate."
            actions={true}
            pageSize={6}
            header={[
              { label: 'User', sortKey: 'name' },
              { label: 'Role', sortKey: 'role' },
            ]}
          />
        </main>
      </div>

      <dialog className="modal" ref={modalRef}>
        <div className="modal-box max-w-lg p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
            <div>
              <h3 className="text-lg font-bold">Add company user</h3>
              <p className="text-xs text-slate-500">Invite a teammate with the right access level.</p>
            </div>
            <button className="btn btn-sm btn-circle btn-ghost" onClick={handleClose} type="button">
              <span className="material-icons text-slate-500">close</span>
            </button>
          </div>
          <div className="p-6 space-y-4">
            {submitError ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {submitError}
              </div>
            ) : null}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="text-xs font-semibold text-slate-600">
                First name
                <input
                  className="input input-bordered w-full mt-2"
                  value={form.firstName}
                  onChange={handleFieldChange('firstName')}
                  placeholder="Stewart"
                />
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Last name
                <input
                  className="input input-bordered w-full mt-2"
                  value={form.lastName}
                  onChange={handleFieldChange('lastName')}
                  placeholder="Jones"
                />
              </label>
            </div>
            <label className="text-xs font-semibold text-slate-600">
              Email
              <input
                className="input input-bordered w-full mt-2"
                type="email"
                value={form.email}
                onChange={handleFieldChange('email')}
                placeholder="teammate@company.com"
              />
            </label>
            <label className="text-xs font-semibold text-slate-600">
              Temporary password
              <input
                className="input input-bordered w-full mt-2"
                type="password"
                value={form.password}
                onChange={handleFieldChange('password')}
                placeholder="Set a secure password"
              />
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-600 mt-2">
              <input
                type="checkbox"
                className="checkbox checkbox-sm border-primary text-primary"
                checked={form.isCompanyAdmin}
                onChange={handleFieldChange('isCompanyAdmin')}
              />
              Grant company admin access
            </label>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
            <p className="text-xs text-slate-500">Admins can manage users and company settings.</p>
            <div className="flex items-center gap-3">
              <button className="btn btn-ghost" onClick={handleClose} type="button">
                Cancel
              </button>
              <button
                className="btn btn-primary"
                type="button"
                onClick={handleCreateUser}
                disabled={isCreating}
              >
                {isCreating ? 'Adding...' : 'Add User'}
              </button>
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop" onClick={handleClose}>
          <button aria-label="Close">close</button>
        </form>
      </dialog>
    </AppLayout>
  )
}
