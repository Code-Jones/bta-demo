import React, { useMemo, useState } from 'react'

export type TableProps = {
    header: SortableHeaderProps[]
    actions: boolean
    rows: React.ReactNode[]
    rowSortValues: Record<string, string | number>[]
    isLoading?: boolean
    loadingMessage?: string
    isError?: boolean
    errorMessage?: string
    emptyMessage?: string
    pageSize?: number
    initialSortKey?: string
    initialSortDirection?: 'asc' | 'desc'
}

export type SortableHeaderProps = {
    label: string
    sortKey: string
    align?: 'center' | 'right'
}

export function Table({
    header,
    rows,
    rowSortValues,
    isLoading,
    loadingMessage = 'Loading records...',
    isError,
    errorMessage = 'Unable to load records.',
    emptyMessage = 'No records found.',
    actions,
    pageSize = 5,
    initialSortKey,
    initialSortDirection = 'desc',
}: TableProps) {
    const [page, setPage] = useState(1)
    const [sortKey, setSortKey] = useState(() => initialSortKey ?? header[0]?.sortKey ?? '')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSortDirection)

    const handleSort = (nextKey: string) => {
        if (sortKey === nextKey) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
        } else {
            setSortKey(nextKey)
            setSortDirection('asc')
        }
    }

    const sortedIndices = useMemo(() => {
        const indices = rows.map((_, i) => i)
        if (!sortKey || rowSortValues.length !== rows.length) return indices
        const dir = sortDirection === 'asc' ? 1 : -1
        return indices.sort((i, j) => {
            const a = rowSortValues[i]?.[sortKey]
            const b = rowSortValues[j]?.[sortKey]
            if (typeof a === 'number' && typeof b === 'number') return ((a ?? 0) - (b ?? 0)) * dir
            return String(a ?? '').localeCompare(String(b ?? '')) * dir
        })
    }, [rows, rowSortValues, sortKey, sortDirection])

    const totalRows = rows.length
    const totalPages = Math.max(1, Math.ceil(totalRows / pageSize))
    const currentPage = Math.min(page, totalPages)

    const start = totalRows === 0 ? 0 : (currentPage - 1) * pageSize + 1
    const end = Math.min(currentPage * pageSize, totalRows)
    const pagedRows = sortedIndices
        .slice((currentPage - 1) * pageSize, currentPage * pageSize)
        .map((i) => rows[i])
    const hasRows = totalRows > 0
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            {isLoading ? (
                <div className="px-6 py-4 text-sm text-slate-500 border-b border-slate-200">
                    {loadingMessage}
                </div>
            ) : null}
            {isError ? (
                <div className="px-6 py-4 text-sm text-rose-700 bg-rose-50 border-b border-rose-200">
                    {errorMessage}
                </div>
            ) : null}
            <div className="overflow-x-auto overflow-y-visible relative z-10">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            {header.map((h) => (
                                <SortableHeader
                                    key={h.sortKey}
                                    {...h}
                                    onSort={handleSort}
                                    isActive={sortKey === h.sortKey}
                                    direction={sortDirection}
                                />
                            ))}
                            {actions ?
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">
                                    Actions
                                </th>
                                : null
                            }
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {hasRows ? (
                            pagedRows.map((row, index) => {
                                return (
                                    <React.Fragment key={index}>
                                        {row}
                                    </React.Fragment>
                                )
                            })
                        ) : (
                            <tr>
                                <td className="px-6 py-10 text-center text-sm text-slate-500" colSpan={header.length + (actions ? 1 : 0)}>
                                    {emptyMessage}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between relative z-0">
                <p className="text-sm text-slate-500">
                    Showing <span className="font-medium text-slate-900">{start}</span>
                    {totalRows > 0 ? (
                        <>–<span className="font-medium text-slate-900">{end}</span></>
                    ) : null}
                    {' '}of <span className="font-medium text-slate-900">{totalRows}</span> results
                </p>
                <div className="flex gap-2">
                    <button
                        type="button"
                        className="p-2 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 transition-colors"
                        disabled={totalRows === 0 || currentPage === 1}
                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    >
                        <span className="material-icons text-base">chevron_left</span>
                    </button>
                    <span className="px-3 py-1 bg-primary text-white text-sm font-medium rounded inline-flex items-center">
                        {currentPage}
                    </span>
                    <button
                        type="button"
                        className="p-2 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 transition-colors"
                        disabled={totalRows === 0 || currentPage >= totalPages}
                        onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    >
                        <span className="material-icons text-base">chevron_right</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

function SortableHeader({
    label,
    sortKey,
    onSort,
    align,
    isActive,
    direction,
}: {
    label: string
    sortKey: string
    onSort: (key: string) => void
    align?: 'center' | 'right'
    isActive?: boolean
    direction?: 'asc' | 'desc'
}) {
    const alignment = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : ''
    const icon = !isActive ? 'swap_vert' : direction === 'asc' ? 'arrow_upward' : 'arrow_downward'
    const tone = isActive ? 'text-slate-800' : 'text-slate-500'
    return (
        <th className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 ${alignment}`}>
            <button
                className={`inline-flex items-center gap-1 ${tone} hover:text-slate-700`}
                onClick={() => onSort(sortKey)}
                type="button"
            >
                {label}
                <span className="material-icons text-sm">{icon}</span>
            </button>
        </th>
    )
}

