import type { MeResponse } from '../api/types'

export const normalizeIsCompanyAdmin = (value: unknown) => value === true || value === 'true'

export function mapMeToAuthUser(res: MeResponse) {
  return {
    userId: res.userId,
    firstName: res.firstName ?? null,
    lastName: res.lastName ?? null,
    company: res.company ?? null,
    organizationId: res.organizationId ?? null,
    organizationName: res.organizationName ?? null,
    isCompanyAdmin: normalizeIsCompanyAdmin(res.isCompanyAdmin),
  }
}
