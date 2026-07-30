'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

interface PaginationProps {
  totalPages: number;
  currentPage: number;
}

export default function Pagination({ totalPages, currentPage }: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Không hiển thị pagination nếu chỉ có 1 trang
  if (totalPages <= 1) return null;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  // Thuật toán để rút gọn danh sách trang nếu quá nhiều (tạo ra dạng 1 ... 4 5 6 ... 10)
  const getVisiblePages = () => {
    const delta = 1 // Số lượng nút hiển thị ở hai bên nút hiện tại
    const range: number[] = []
    
    for (
      let i = Math.max(2, currentPage - delta); 
      i <= Math.min(totalPages - 1, currentPage + delta); 
      i++
    ) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      range.unshift(-1) // -1 biểu diễn dấu '...'
    }
    if (currentPage + delta < totalPages - 1) {
      range.push(-1)
    }

    range.unshift(1) // Luôn hiện trang 1
    if (totalPages > 1) {
      range.push(totalPages) // Luôn hiện trang cuối
    }

    return range
  }

  return (
    <div className="flex items-center justify-center space-x-2 mt-10 mb-6">
      <button
        onClick={() => router.push(createPageURL(currentPage - 1))}
        disabled={currentPage <= 1}
        className="flex items-center justify-center w-10 h-10 min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
      >
        <span className="sr-only">Previous</span>
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>

      {getVisiblePages().map((page, index) => (
        page === -1 ? (
          <span key={`ellipsis-${index}`} className="flex items-center justify-center px-2 text-slate-400 dark:text-slate-500">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => router.push(createPageURL(page))}
            className={`flex items-center justify-center w-10 h-10 min-h-[44px] min-w-[44px] rounded-xl border transition-all font-medium text-sm shadow-sm ${
              currentPage === page
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/30 -translate-y-0.5'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 hover:border-indigo-300'
            }`}
          >
            {page}
          </button>
        )
      ))}

      <button
        onClick={() => router.push(createPageURL(currentPage + 1))}
        disabled={currentPage >= totalPages}
        className="flex items-center justify-center w-10 h-10 min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
      >
        <span className="sr-only">Next</span>
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  )
}
