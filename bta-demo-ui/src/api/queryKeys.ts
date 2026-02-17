export const queryKeys = {
  dashboard: {
    all: ['dashboard'] as const,
    scoreboard: () => [...queryKeys.dashboard.all, 'scoreboard'] as const,
    scoreboardRange: (startDate = '', endDate = '') =>
      [...queryKeys.dashboard.scoreboard(), startDate, endDate] as const,
    revenue: () => [...queryKeys.dashboard.all, 'revenue'] as const,
    revenueRange: (startDate = '', endDate = '') =>
      [...queryKeys.dashboard.revenue(), startDate, endDate] as const,
    report: () => [...queryKeys.dashboard.all, 'report'] as const,
    reportRange: (startDate = '', endDate = '') =>
      [...queryKeys.dashboard.report(), startDate, endDate] as const,
  },
  leads: {
    all: ['leads'] as const,
    list: (includeDeleted = false) => [...queryKeys.leads.all, 'list', includeDeleted] as const,
    detail: (id: string) => [...queryKeys.leads.all, 'detail', id] as const,
    metrics: () => [...queryKeys.leads.all, 'metrics'] as const,
  },
  estimates: {
    all: ['estimates'] as const,
    list: () => [...queryKeys.estimates.all, 'list'] as const,
  },
  jobs: {
    all: ['jobs'] as const,
    list: () => [...queryKeys.jobs.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.jobs.all, 'detail', id] as const,
  },
  invoices: {
    all: ['invoices'] as const,
    list: () => [...queryKeys.invoices.all, 'list'] as const,
    metrics: () => [...queryKeys.invoices.all, 'metrics'] as const,
  },
  pipeline: {
    all: ['pipeline'] as const,
    board: () => [...queryKeys.pipeline.all, 'board'] as const,
  },
  companies: {
    all: ['companies'] as const,
    list: (includeDeleted = false) => [...queryKeys.companies.all, 'list', includeDeleted] as const,
    detail: (id: string) => [...queryKeys.companies.all, 'detail', id] as const,
  },
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
    login: () => [...queryKeys.auth.all, 'login'] as const,
    register: () => [...queryKeys.auth.all, 'register'] as const,
    logout: () => [...queryKeys.auth.all, 'logout'] as const,
    forgotPassword: () => [...queryKeys.auth.all, 'forgotPassword'] as const,
  }
}
