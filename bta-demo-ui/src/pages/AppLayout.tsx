import React from 'react'
import { AppSidebar } from '../components/AppSidebar'

export type AppLayoutProps = {
    children: React.ReactNode
    modals: React.ReactNode[]
}

export const AppLayout = ({ children, modals }: AppLayoutProps) => {
    return (
        <div className="bg-background-light text-slate-900 h-screen flex flex-col overflow-hidden">
            <div className="flex flex-1 min-h-0 w-full">
                <AppSidebar />
                <div className="flex-1 min-h-0 min-w-0 overflow-auto">
                    {children}
                </div>
            </div>
            {modals.map((modal) => modal)}
        </div>
    )
}