export const queryKeys = {
  dashboard: {
    all: ['dashboard'] as const,
    scoreboard: () => [...queryKeys.dashboard.all, 'scoreboard'] as const,
  },
  leads: {
    all: ['leads'] as const,
  },
  estimates: {
    all: ['estimates'] as const,
  },
  jobs: {
    all: ['jobs'] as const,
  },
  invoices: {
    all: ['invoices'] as const,
  },
}
