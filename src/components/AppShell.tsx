'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import MobileHeader from './MobileHeader'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Don't show sidebar on auth pages
  const isAuthPage = pathname.startsWith('/auth')

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <MobileHeader onMenuToggle={() => setSidebarOpen(prev => !prev)} />
      <main className="lg:ml-[var(--sidebar-width)] min-h-screen transition-[margin] duration-300">
        {children}
      </main>
    </>
  )
}
