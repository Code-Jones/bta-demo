import * as d3 from 'd3'
import type { TrendPoint, TrendChartResponse } from '../api'

type CumulativeSeriesPoint = {
  date: Date
  value: number
}

export type RevenueTrendChartOptions = {
  height: number
  width: number
  margin: {
    top: number
    right: number
    bottom: number
    left: number
  }
  yTicks: number
  xTicks: number
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const buildCumulativeSeries = (points: TrendPoint[], rangeStart: Date, rangeEnd: Date) => {
  if (points.length === 0) return []

  const parsed = points
    .filter((point) => new Date(point.date).getTime() >= rangeStart.getTime() && new Date(point.date).getTime() <= rangeEnd.getTime())
    .map((point) => ({ date: new Date(point.date), value: point.value }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  let running = 0
  return parsed.map((point) => {
    running += point.value
    return { ...point, value: running }
  })
}


const extendSeriesToRange = (
  series: CumulativeSeriesPoint[],
  rangeStart: Date,
  rangeEnd: Date,
) => {
  if (series.length === 0) return series
  const sorted = [...series].sort((a, b) => a.date.getTime() - b.date.getTime())
  const extended = [...sorted]

  if (sorted[0].date.getTime() > rangeStart.getTime()) {
    extended.unshift({ date: rangeStart, value: 0 })
  }
  if (sorted[sorted.length - 1].date.getTime() < rangeEnd.getTime()) {
    extended.push({ date: rangeEnd, value: sorted[sorted.length - 1].value })
  }
  return extended
}

const resolveSeriesExtent = (seriesGroups: CumulativeSeriesPoint[][]) => {
  const dates = seriesGroups.flat().map((point) => point.date)
  if (dates.length === 0) return null
  const extent = d3.extent(dates) as [Date, Date]
  return extent[0].getTime() === extent[1].getTime() ? [extent[0], new Date(extent[1].getTime() + 24 * 60 * 60 * 1000)] : extent
}

const resolveValueExtent = (seriesGroups: CumulativeSeriesPoint[][]) => {
  const values = seriesGroups.flat().map((point) => point.value)
  if (values.length === 0) return null
  return d3.extent(values) as [number, number]
}

function escapeHtml(text: string) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function RevenueTrendChart({ data, isLoading, isError, rangeStart, rangeEnd, options, printMode }: {
  data?: TrendChartResponse
  isLoading: boolean
  isError: boolean
  rangeStart: Date
  rangeEnd: Date
  options: RevenueTrendChartOptions
  printMode?: boolean
}) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
        Loading revenue and expense trends...
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-600">
        Unable to load revenue or expense history.
      </div>
    )
  }

  if (data?.revenuePoints.length === 0 && data?.expensePoints.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
        No revenue or expense history yet.
      </div>
    )
  }

  const revenueSeries = data?.revenuePoints ? buildCumulativeSeries(data?.revenuePoints, rangeStart, rangeEnd) : []
  const expenseSeries = data?.expensePoints ? buildCumulativeSeries(data?.expensePoints, rangeStart, rangeEnd) : []

  const dateTimeExtent = resolveSeriesExtent([revenueSeries, expenseSeries])
  const valueExtent = resolveValueExtent([revenueSeries, expenseSeries])

  if (!dateTimeExtent || !valueExtent) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
        No revenue or expense history yet.
      </div>
    )
  }

  const xScale = d3.scaleTime().domain(dateTimeExtent).range([options.margin.left, options.width - options.margin.right])
  const yScale = d3.scaleLinear().domain([0, valueExtent[1] * 1.15]).range([options.height - options.margin.bottom, options.margin.top])

  const revenueChartPoints = extendSeriesToRange(revenueSeries, dateTimeExtent[0], dateTimeExtent[1]);
  const expenseChartPoints = extendSeriesToRange(expenseSeries, dateTimeExtent[0], dateTimeExtent[1]);


  const revenueLine = d3
    .line<CumulativeSeriesPoint>()
    .x((d) => xScale(d.date))
    .y((d) => yScale(d.value))
    .curve(d3.curveMonotoneX)

  const revenueArea = d3
    .area<CumulativeSeriesPoint>()
    .x((d) => xScale(d.date))
    .y0(options.height - options.margin.bottom)
    .y1((d) => yScale(d.value))
    .curve(d3.curveMonotoneX)

  const expenseLine = d3
    .line<CumulativeSeriesPoint>()
    .x((d) => xScale(d.date))
    .y((d) => yScale(d.value))
    .curve(d3.curveMonotoneX)

  const expenseArea = d3
    .area<CumulativeSeriesPoint>()
    .x((d) => xScale(d.date))
    .y0(options.height - options.margin.bottom)
    .y1((d) => yScale(d.value))
    .curve(d3.curveMonotoneX)

  const revenueLinePath = revenueLine(revenueChartPoints)
  const revenueAreaPath = revenueArea(revenueChartPoints)
  const expenseLinePath = expenseLine(expenseChartPoints)
  const expenseAreaPath = expenseArea(expenseChartPoints)
  const xTicks = xScale.ticks(5)
  const yTicks = yScale.ticks(5)
  const totalRevenue = revenueSeries[revenueSeries.length - 1]?.value ?? 0
  const totalExpenses = expenseSeries[expenseSeries.length - 1]?.value ?? 0

  if (printMode) {
    const yTicksHtml = yTicks.map((tick) =>
      `<g>
        <line x1="${options.margin.left}" x2="${options.width - options.margin.right}" y1="${yScale(tick)}" y2="${yScale(tick)}" stroke="#e2e8f0" stroke-dasharray="2 4" />
        <text x="${options.margin.left - 8}" y="${yScale(tick)}" font-size="10" fill="#94a3b8" text-anchor="end" dominant-baseline="middle">
        ${escapeHtml(currencyFormatter.format(tick))}
        </text>
      </g>`)
      .join('')

    const revenueCircles = revenueSeries.map((point) =>
      `<circle cx="${xScale(point.date)}" cy="${yScale(point.value)}" r="4" fill="#ffffff" stroke="#2563eb" stroke-width="2" />`).join('')

    const expenseCircles = expenseSeries.map((point) =>
      `<circle cx="${xScale(point.date)}" cy="${yScale(point.value)}" r="4" fill="#ffffff" stroke="#f59e0b" stroke-width="2" />`).join('')

    const xTicksHtml = xTicks.map((tick) =>
      `<text x="${xScale(tick)}" y="${options.height - options.margin.bottom + 20}" font-size="10" fill="#94a3b8" text-anchor="middle">
        ${escapeHtml(dateFormatter.format(tick))}
      </text>`).join('')

    return `
          <div class="rounded-xl border border-slate-200 bg-white p-5">
            <div class="flex gap-4 items-center justify-between mb-4">
              <div class="flex flex-wrap items-center gap-6">
                <div>
                  <p class="text-xs uppercase tracking-widest text-slate-400 font-bold">Paid Revenue (Cumulative)</p>
                  <p class="text-lg font-bold">${escapeHtml(currencyFormatter.format(totalRevenue))}</p>
                </div>
                <div>
                  <p class="text-xs uppercase tracking-widest text-slate-400 font-bold">Job Expenses (Cumulative)</p>
                  <p class="text-lg font-bold text-amber-600">${escapeHtml(currencyFormatter.format(totalExpenses))}</p>
                </div>
                <div class="flex items-center gap-4 text-xs text-slate-400">
                  <span class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-blue-600"></span>Revenue</span>
                  <span class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-amber-500"></span>Expenses</span>
                </div>
              </div>
              <div class="text-xs text-slate-500">${escapeHtml(dateFormatter.format(dateTimeExtent[0]))} - ${escapeHtml(dateFormatter.format(dateTimeExtent[1]))}</div>
            </div>
            <svg viewBox="0 0 ${options.width} ${options.height}" class="w-full h-56">
              <defs>
                <linearGradient id="reportRevenueGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stop-color="#2563eb" stop-opacity="0.25" />
                  <stop offset="100%" stop-color="#2563eb" stop-opacity="0" />
                </linearGradient>
                <linearGradient id="reportExpenseGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.18" />
                  <stop offset="100%" stop-color="#f59e0b" stop-opacity="0" />
                </linearGradient>
              </defs>
              <g>
                ${yTicksHtml}
                ${expenseAreaPath ? `<path d="${expenseAreaPath.replaceAll('"', '&quot;')}" fill="url(#reportExpenseGradient)" />` : ''}
                ${revenueAreaPath ? `<path d="${revenueAreaPath.replaceAll('"', '&quot;')}" fill="url(#reportRevenueGradient)" />` : ''}
                ${expenseLinePath ? `<path d="${expenseLinePath.replaceAll('"', '&quot;')}" fill="none" stroke="#f59e0b" stroke-width="2" />` : ''}
                ${revenueLinePath ? `<path d="${revenueLinePath.replaceAll('"', '&quot;')}" fill="none" stroke="#2563eb" stroke-width="2" />` : ''}
                ${expenseCircles}
                ${revenueCircles}
                ${xTicksHtml}
              </g>
            </svg>
          </div>
        `
  } else {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Paid Revenue (Cumulative)</p>
              <p className="text-lg font-bold">{currencyFormatter.format(totalRevenue)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Job Expenses (Cumulative)</p>
              <p className="text-lg font-bold text-amber-600">{currencyFormatter.format(totalExpenses)}</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                Revenue
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Expenses
              </span>
            </div>
          </div>
          <div className="text-xs text-slate-500">
            {dateFormatter.format(dateTimeExtent[0])} - {dateFormatter.format(dateTimeExtent[1])}
          </div>
        </div>
        <svg viewBox={`0 0 ${options.width} ${options.height}`} className="w-full h-56">
          <defs>
            <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g>
            {yTicks.map((tick) => (
              <g key={tick}>
                <line
                  x1={options.margin.left}
                  x2={options.width - options.margin.right}
                  y1={yScale(tick)}
                  y2={yScale(tick)}
                  stroke="#e2e8f0"
                  strokeDasharray="2 4"
                />
                <text
                  x={options.margin.left - 8}
                  y={yScale(tick)}
                  fontSize="10"
                  fill="#94a3b8"
                  textAnchor="end"
                  dominantBaseline="middle"
                >
                  {currencyFormatter.format(tick)}
                </text>
              </g>
            ))}
            {expenseAreaPath ? <path d={expenseAreaPath} fill="url(#expenseGradient)" /> : null}
            {revenueAreaPath ? <path d={revenueAreaPath} fill="url(#revenueGradient)" /> : null}
            {expenseLinePath ? <path d={expenseLinePath} fill="none" stroke="#f59e0b" strokeWidth="2" /> : null}
            {revenueLinePath ? <path d={revenueLinePath} fill="none" stroke="#2563eb" strokeWidth="2" /> : null}
            {revenueSeries.map((point, index) => (
              <circle
                key={`${point.date.toISOString()}-revenue-${index}`}
                cx={xScale(point.date)}
                cy={yScale(point.value)}
                r={4}
                fill="#ffffff"
                stroke="#2563eb"
                strokeWidth={2}
              />
            ))}
            {expenseSeries.map((point, index) => (
              <circle
                key={`${point.date.toISOString()}-expense-${index}`}
                cx={xScale(point.date)}
                cy={yScale(point.value)}
                r={4}
                fill="#ffffff"
                stroke="#f59e0b"
                strokeWidth={2}
              />
            ))}
            {xTicks.map((tick) => (
              <text
                key={tick.toISOString()}
                x={xScale(tick)}
                y={options.height - options.margin.bottom + 20}
                fontSize="10"
                fill="#94a3b8"
                textAnchor="middle"
              >
                {dateFormatter.format(tick)}
              </text>
            ))}
          </g>
        </svg>
      </div>
    )
  }
}
