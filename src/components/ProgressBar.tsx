'use client'

import { useEffect, useState } from 'react'

interface Props {
  progress: number
  variant?: 'light' | 'dark'
  size?: 'sm' | 'md'
  hideLabel?: boolean
}

export default function ProgressBar({ progress, variant = 'dark', size = 'md', hideLabel = false }: Props) {
  const [width, setWidth] = useState(0)

  // Hiệu ứng chạy thanh ngang từ 0 lên giá trị thực khi component được render
  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(progress)
    }, 100)
    return () => clearTimeout(timer)
  }, [progress])

  const isLight = variant === 'light'
  
  const textClass = isLight ? "text-slate-700 dark:text-slate-300" : "text-white drop-shadow-md"
  const percentClass = isLight ? "text-indigo-600 dark:text-indigo-400" : "text-indigo-300 drop-shadow-md"
  const containerClass = isLight ? "bg-slate-200 dark:bg-slate-700 shadow-inner" : "bg-white/20 backdrop-blur-md border border-white/10 shadow-inner"
  
  const heightClass = size === 'sm' ? "h-1.5" : "h-3"
  const textBase = size === 'sm' ? "text-xs" : "text-sm"
  const mtClass = size === 'sm' ? "mt-3" : "mt-6"

  return (
    <div className={`w-full max-w-md ${mtClass}`}>
      {!hideLabel && (
        <div className="flex justify-between items-end mb-1.5">
          <span className={`${textBase} font-bold ${textClass}`}>
            Tiến độ
          </span>
          <span className={`${textBase} font-bold ${percentClass}`}>
            {Math.round(progress)}%
          </span>
        </div>
      )}
      
      {/* Container của thanh bar */}
      <div className={`w-full ${heightClass} ${containerClass} rounded-full overflow-hidden`}>
        {/* Phần đổ màu (có animation width) */}
        <div 
          className={`h-full bg-gradient-to-r from-indigo-500 to-purple-400 rounded-full transition-all duration-1000 ease-out ${isLight ? '' : 'shadow-[0_0_10px_rgba(167,139,250,0.5)]'}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}
