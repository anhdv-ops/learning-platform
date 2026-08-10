'use client'

import { useTheme } from '@/contexts/ThemeContext'

interface MobileHeaderProps {
  onMenuToggle: () => void
}

export default function MobileHeader({ onMenuToggle }: MobileHeaderProps) {
  const { isDark } = useTheme()

  return (
    <header
      className="sticky top-0 z-30 lg:hidden flex items-center justify-between px-4 py-3 backdrop-blur-xl border-b"
      style={{
        backgroundColor: isDark ? '#12121a' : '#ffffff',
        color: isDark ? '#f0f0f5' : '#0f172a',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'
      }}
    >
      {/* Hamburger Button */}
      <button
        onClick={onMenuToggle}
        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-bg-card-hover transition-colors cursor-pointer"
        aria-label="Toggle menu"
      >
        <svg className="w-5 h-5 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <span className="text-base font-bold tracking-tight text-text-primary">LishTex</span>
      </div>

      {/* Spacer for symmetry */}
      <div className="w-10" />
    </header>
  )
}
