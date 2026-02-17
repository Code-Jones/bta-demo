import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { SectionCard } from '../../components/SectionCard'
import { StatCard } from '../../components/StatCard'
import { ConversionSteps } from '../../components/ConversionSteps'
import { RevenueTrendChart } from '../../components/RevenueTrendChart'
import { getDashboardReport, scoreboardQueryOptions, trendChartQueryOptions } from '../../api/dashboard'
import type {
  DashboardReportResponse,
  ScoreboardResponse,
} from '../../api'
import { formatCurrency, formatDateString, escapeHtml, exportReport, formatLeadStatus, formatEstimateStatus, formatJobStatus } from '../../utils'
import { makeConversionSteps, makeStatCards } from './config'
import { AppLayout } from '../AppLayout'



export function DashboardPage() {
  const navigate = useNavigate()
  const today = new Date()

  const [startDate, setStartDate] = useState<Date>(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)) // 30 days ago
  const [endDate, setEndDate] = useState<Date>(today) // today
  const [reportError, setReportError] = useState<string | null>(null)

  const scoreboardQuery = useQuery(scoreboardQueryOptions({ startDate, endDate }))
  const revenueQuery = useQuery(trendChartQueryOptions({ startDate, endDate }))
  const { data, isLoading, isError, error } = scoreboardQuery

  const scoreboard: ScoreboardResponse = data ?? {
    leads: 0,
    estimatesDraft: 0,
    estimatesSent: 0,
    estimatesAccepted: 0,
    estimatesRejected: 0,
    jobsScheduled: 0,
    invoicesPaid: 0,
    invoicesUnpaid: 0,
    invoicesOverdue: 0,
    totalRevenuePaid: 0,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    previous: {
      leads: 0,
      estimatesSent: 0,
      estimatesAccepted: 0,
      jobsScheduled: 0,
      invoicesPaid: 0,
      totalRevenuePaid: 0,
    },
  }

  const totalEstimates =
    scoreboard.estimatesDraft +
    scoreboard.estimatesSent +
    scoreboard.estimatesAccepted +
    scoreboard.estimatesRejected

  const estimateConversion = scoreboard.leads
    ? (totalEstimates / scoreboard.leads) * 100
    : 0

  const jobConversion = scoreboard.leads
    ? (scoreboard.jobsScheduled / scoreboard.leads) * 100
    : 0

  const hasActivity =
    scoreboard.leads > 0 ||
    totalEstimates > 0 ||
    scoreboard.jobsScheduled > 0 ||
    scoreboard.invoicesPaid > 0 ||
    scoreboard.invoicesUnpaid > 0 ||
    scoreboard.totalRevenuePaid > 0

  const reportMutation = useMutation({
    mutationFn: (params?: { startDate: Date; endDate: Date }) => getDashboardReport(params),
    onSuccess: (report) => {
      setReportError(null)
      openDashboardReport(report)
    },
    onError: (mutationError) => {
      const apiError = mutationError as { message?: string }
      setReportError(apiError?.message || 'Unable to export report.')
    },
  })

  return (
    <AppLayout modals={[]}>
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Executive Scoreboard
          </h1>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="material-symbols-outlined text-sm">calendar_month</span>
              <input
                type="date"
                className="input input-bordered input-xs"
                value={startDate.toISOString().slice(0, 10)}
                onChange={(event) => setStartDate(new Date(event.target.value))}
              />
              <span className="text-slate-300">—</span>
              <input
                type="date"
                className="input input-bordered input-xs"
                value={endDate.toISOString().slice(0, 10)}
                onChange={(event) => setEndDate(new Date(event.target.value))}
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                className="btn btn-sm bg-primary text-white hover:bg-primary/90"
                onClick={() => reportMutation.mutate({ startDate, endDate })}
                disabled={reportMutation.isPending}
              >
                {reportMutation.isPending ? 'Exporting...' : 'Export Report'}
              </button>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
              Loading scoreboard...
            </div>
          ) : null}

          {isError ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {error?.message || 'Unable to load the scoreboard.'}
            </div>
          ) : null}
          {!isLoading && !isError && !hasActivity ? (
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
              No activity yet. Create your first lead to start the pipeline.
            </div>
          ) : null}
          {reportError ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {reportError}
            </div>
          ) : null}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {makeStatCards(scoreboard).map((card) => (
              <StatCard
                key={card.label}
                label={card.label}
                value={card.value.toString()}
                current={card.current}
                previous={card.previous}
                highlight={card.highlight}
              />
            ))}
          </div>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-7 space-y-6">
              <SectionCard title="Conversion Efficiency" badge="LEAD-TO-JOB">
                <ConversionSteps
                  steps={makeConversionSteps(scoreboard, estimateConversion, jobConversion)} />
              </SectionCard>

              <SectionCard title="Revenue & Expense Trends">
                <RevenueTrendChart
                  data={revenueQuery.data}
                  isLoading={revenueQuery.isLoading}
                  isError={revenueQuery.isError}
                  rangeStart={startDate}
                  rangeEnd={endDate}
                  options={{
                    height: 220,
                    width: 640,
                    margin: { top: 16, right: 24, bottom: 32, left: 48 },
                    yTicks: 5,
                    xTicks: 5,
                  }}
                  printMode={false}
                />
              </SectionCard>
            </div>

            <div className="col-span-12 lg:col-span-5 space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-200 bg-slate-50/30">
                  <h2 className="text-sm font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500 text-lg">
                      priority_high
                    </span>
                    What Needs Attention
                  </h2>
                </div>
                <div className="p-5 border-b border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Overdue Invoices
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full font-bold">
                      {scoreboard.invoicesOverdue} Late
                    </span>
                  </div>
                  <div className="space-y-3">
                    {scoreboard.invoicesOverdue === 0 ? (
                      <p className="text-xs text-slate-500">No overdue invoices yet.</p>
                    ) : (
                      <p className="text-xs text-slate-500">
                        There are overdue invoices to review.
                      </p>
                    )}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Follow-ups Required
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 bg-accent/10 text-accent rounded-full font-bold">
                      {scoreboard.estimatesSent.toString()} Pending
                    </span>
                  </div>
                  <div className="space-y-4">
                    {scoreboard.estimatesSent === 0 ? (
                      <p className="text-xs text-slate-500">No follow-ups required yet.</p>
                    ) : (
                      <p className="text-xs text-slate-500">
                        Sent estimates are waiting for responses.
                      </p>
                    )}
                  </div>
                </div>
                <div className="p-4 bg-slate-50/50 text-center border-t border-slate-200">
                  <button
                    className="text-[10px] font-bold text-slate-500 hover:text-primary tracking-widest uppercase flex items-center justify-center gap-2 w-full"
                    onClick={() => navigate({ to: '/app/pipeline' })}
                  >
                    View All Action Items
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AppLayout >
  )
}

function openDashboardReport(report: DashboardReportResponse) {

  const revenueChartHtml = RevenueTrendChart({
    data: report.chartData,
    isLoading: false,
    isError: false,
    rangeStart: new Date(report.scoreboard.startDate),
    rangeEnd: new Date(report.scoreboard.endDate),
    options: { height: 220, width: 640, margin: { top: 16, right: 24, bottom: 32, left: 48 }, yTicks: 5, xTicks: 5 },
    printMode: true,
  })

  const leadRows = report.leads
    .map((lead) => {
      return `
        <tr>
          <td>${escapeHtml(lead.name)}</td>
          <td>${escapeHtml(lead.company ?? '—')}</td>
          <td>${escapeHtml(formatLeadStatus(lead.status))}</td>
          <td>${escapeHtml(formatDateString(lead.createdAtUtc))}</td>
        </tr>
      `
    })
    .join('')

  const estimateRows = report.estimates
    .map((estimate) => {
      return `
        <tr>
          <td>${escapeHtml(estimate.leadName)}</td>
          <td>${formatCurrency(estimate.amount)}</td>
          <td>${escapeHtml(formatEstimateStatus(estimate.status))}</td>
          <td>${escapeHtml(formatDateString(estimate.createdAtUtc))}</td>
        </tr>
      `
    })
    .join('')

  const jobRows = report.jobs
    .map((job) => {
      return `
        <tr>
          <td>${escapeHtml(job.leadName)}</td>
          <td>${escapeHtml(formatJobStatus(job.status))}</td>
          <td>${escapeHtml(formatDateString(job.startAtUtc))}</td>
        </tr>
      `
    })
    .join('')

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Dashboard Report</title>
        <style>
          body { font-family: "Helvetica Neue", Arial, sans-serif; color: #0f172a; padding: 32px; }
          h1 { font-size: 24px; margin: 0; }
          h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin: 24px 0 8px; }
          .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
          .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }
          .meta { font-size: 12px; color: #475569; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th, td { border-bottom: 1px solid #e2e8f0; padding: 6px 4px; font-size: 11px; text-align: left; }
          th { text-transform: uppercase; color: #64748b; font-size: 10px; }
          .num { text-align: right; }
        </style>
      </head>
      <body>
        <h1>Performance Report</h1>
        <div class="meta">${escapeHtml(formatDateString(report.scoreboard.startDate))} - ${escapeHtml(formatDateString(report.scoreboard.endDate))}</div>

        <div class="grid" style="margin-top: 16px;">
          <div class="card"><div class="meta">Leads</div><div style="font-size: 18px; font-weight: 700;">${report.scoreboard.leads.toString()}</div></div>
          <div class="card"><div class="meta">Estimates Sent</div><div style="font-size: 18px; font-weight: 700;">${report.scoreboard.estimatesSent.toString()}</div></div>
          <div class="card"><div class="meta">Jobs Scheduled</div><div style="font-size: 18px; font-weight: 700;">${report.scoreboard.jobsScheduled.toString()}</div></div>
          <div class="card"><div class="meta">Invoices Paid</div><div style="font-size: 18px; font-weight: 700;">${report.scoreboard.invoicesPaid.toString()}</div></div>
          <div class="card"><div class="meta">Revenue Paid</div><div style="font-size: 18px; font-weight: 700;">$${report.scoreboard.totalRevenuePaid.toString()}</div></div>
          <div class="card"><div class="meta">Overdue Invoices</div><div style="font-size: 18px; font-weight: 700;">${report.scoreboard.invoicesOverdue.toString()}</div></div>
        </div>

        <div class="card" style="margin-top: 16px;">
          <h2>Revenue & Expense Performance</h2>
          ${revenueChartHtml}
        </div>

        <div class="card" style="margin-top: 16px;">
          <h2>Active Leads</h2>
          <table>
            <thead><tr><th>Name</th><th>Company</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${leadRows || '<tr><td colspan="4">No active leads.</td></tr>'}</tbody>
          </table>
        </div>

        <div class="card" style="margin-top: 16px;">
          <h2>Active Estimates</h2>
          <table>
            <thead><tr><th>Lead</th><th class="num">Amount</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>${estimateRows || '<tr><td colspan="4">No active estimates.</td></tr>'}</tbody>
          </table>
        </div>

        <div class="card" style="margin-top: 16px;">
          <h2>Active Jobs</h2>
          <table>
            <thead><tr><th>Lead</th><th>Status</th><th>Scheduled</th></tr></thead>
            <tbody>${jobRows || '<tr><td colspan="3">No active jobs.</td></tr>'}</tbody>
          </table>
        </div>
      </body>
    </html>
  `

  exportReport(html)
}
