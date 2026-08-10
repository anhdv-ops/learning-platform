'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useState, useEffect, ChangeEvent } from 'react'

export default function SearchFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const initialSearch = searchParams.get('q') || ''
  let rawLevel = searchParams.get('level') || ''
  rawLevel = rawLevel.trim()
  if (rawLevel === '7.0' || rawLevel === '7.0 ') rawLevel = '7.0+'
  if (rawLevel === '750' || rawLevel === '750 ') rawLevel = '750+'
  if (rawLevel === '5.0' || rawLevel === '5.0 ') rawLevel = '5.0+'
  if (rawLevel === '6.0' || rawLevel === '6.0 ') rawLevel = '6.0+'
  if (rawLevel === '500' || rawLevel === '500 ') rawLevel = '500+'
  if (rawLevel === '650' || rawLevel === '650 ') rawLevel = '650+'

  const selectedLevel = rawLevel
  const [searchTerm, setSearchTerm] = useState(initialSearch)

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(name, value)
    } else {
      params.delete(name)
    }
    params.delete('page')
    return params.toString()
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== (searchParams.get('q') || '')) {
        router.push(`${pathname}?${createQueryString('q', searchTerm)}`)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [searchTerm, pathname, router, searchParams])

  const handleLevelChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    router.push(`${pathname}?${createQueryString('level', value)}`)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-8">
      {/* Search input */}
      <div className="relative flex-grow max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <svg className="h-[18px] w-[18px] text-text-tertiary" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm khóa học..."
          className="glass-input block w-full pl-10 pr-4 py-2.5 min-h-[44px] text-sm"
        />
      </div>

      {/* Level select */}
      <div className="relative w-full sm:w-48">
        <select
          value={selectedLevel}
          onChange={handleLevelChange}
          className="glass-input block w-full pl-4 pr-10 py-2.5 min-h-[44px] text-sm appearance-none cursor-pointer"
        >
          <option value="" className="bg-[#12121a] text-[#f0f0f5]">Tất cả Level</option>
          <option value="Basic" className="bg-[#12121a] text-[#f0f0f5]">Basic (Cơ bản)</option>
          <option value="7.0+" className="bg-[#12121a] text-[#f0f0f5]">IELTS 7.0+</option>
          <option value="750+" className="bg-[#12121a] text-[#f0f0f5]">TOEIC 750+</option>
          <option value="5.0+" className="bg-[#12121a] text-[#f0f0f5]">IELTS 5.0+</option>
          <option value="6.0+" className="bg-[#12121a] text-[#f0f0f5]">IELTS 6.0+</option>
          <option value="500+" className="bg-[#12121a] text-[#f0f0f5]">TOEIC 500+</option>
          <option value="650+" className="bg-[#12121a] text-[#f0f0f5]">TOEIC 650+</option>
          <option value="S" className="bg-[#12121a] text-[#f0f0f5]">S (Starter)</option>
          <option value="Pres" className="bg-[#12121a] text-[#f0f0f5]">Pres (Pre-Starter)</option>
          <option value="TC" className="bg-[#12121a] text-[#f0f0f5]">TC (Target Course)</option>
          <option value="MTC" className="bg-[#12121a] text-[#f0f0f5]">MTC (Master Target Course)</option>
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-text-tertiary">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  )
}
