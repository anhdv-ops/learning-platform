'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useState, useEffect, ChangeEvent } from 'react'

export default function SearchFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const initialSearch = searchParams.get('q') || ''
  const initialLevel = searchParams.get('level') || ''

  const [searchTerm, setSearchTerm] = useState(initialSearch)

  // Hàm tạo query string mới
  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(name, value)
    } else {
      params.delete(name)
    }
    // Xóa param page để đưa người dùng về trang 1 mỗi khi lọc/tìm kiếm
    params.delete('page')
    return params.toString()
  }

  // Effect xử lý debounce cho ô tìm kiếm
  useEffect(() => {
    const timer = setTimeout(() => {
      // Chỉ push lên URL nếu nội dung tìm kiếm khác với param hiện tại
      if (searchTerm !== (searchParams.get('q') || '')) {
        router.push(`${pathname}?${createQueryString('q', searchTerm)}`)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm, pathname, router, searchParams])

  // Xử lý khi đổi level select
  const handleLevelChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    router.push(`${pathname}?${createQueryString('level', value)}`)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      {/* Ô tìm kiếm */}
      <div className="relative flex-grow max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm khóa học..."
          className="block w-full pl-10 pr-4 py-2.5 min-h-[44px] border border-slate-200 dark:border-slate-700 rounded-xl leading-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all sm:text-sm shadow-sm"
        />
      </div>

      {/* Select lọc theo level */}
      <div className="relative w-full sm:w-48">
        <select
          value={initialLevel}
          onChange={handleLevelChange}
          className="block w-full pl-4 pr-10 py-2.5 min-h-[44px] border border-slate-200 dark:border-slate-700 rounded-xl leading-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all sm:text-sm appearance-none cursor-pointer shadow-sm"
        >
          <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Tất cả (All)</option>
          <option value="S" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">S (Starter)</option>
          <option value="Pres" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Pres (Pre-Starter)</option>
          <option value="TC" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">TC (Target Course)</option>
          <option value="MTC" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">MTC (Master Target Course)</option>
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  )
}
