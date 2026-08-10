'use client'

import { useEffect, useState } from 'react'

interface Props {
  progress: number
  size?: 'sm' | 'md'
  hideLabel?: boolean
}

export default function ProgressBar({ progress, size = 'md', hideLabel = false }: Props) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(progress)
    }, 100)
    return () => clearTimeout(timer)
  }, [progress])

  const heightClass = size === 'sm' ? 'h-1.5' : 'h-2.5'
  const textBase = size === 'sm' ? 'text-xs' : 'text-sm'
  const mtClass = size === 'sm' ? 'mt-0' : 'mt-4'

  return (
    <div className={`w-full ${mtClass}`}>
      {!hideLabel && (
        <div className="flex justify-between items-end mb-2">
          <span className={`${textBase} font-medium text-text-secondary`}>
            Tiến độ
          </span>
          <span className={`${textBase} font-bold gradient-text`}>
            {Math.round(progress)}%
          </span>
        </div>
      )}

      {/* Track */}
      <div className={`w-full ${heightClass} bg-bg-card rounded-full overflow-hidden border border-border-subtle`}>
        {/* Fill */}
        <div
          className="h-full bg-gradient-to-r from-accent-violet to-accent-cyan rounded-full transition-all duration-1000 ease-out relative"
          style={{ width: `${width}%` }}
        >
          {/* Subtle glow on the tip */}
          {width > 5 && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-accent-cyan rounded-full blur-sm opacity-60" />
          )}
        </div>
      </div>
    </div>
  )
}
