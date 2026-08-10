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

  if (totalPages <= 1) return null;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  const getVisiblePages = () => {
    const delta = 1
    const range: number[] = []

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      range.unshift(-1)
    }
    if (currentPage + delta < totalPages - 1) {
      range.push(-1)
    }

    range.unshift(1)
    if (totalPages > 1) {
      range.push(totalPages)
    }

    return range
  }

  const buttonBase = "flex items-center justify-center w-10 h-10 min-h-[44px] min-w-[44px] rounded-xl text-sm font-medium transition-all duration-200"

  return (
    <div className="flex items-center justify-center space-x-2 mt-10 mb-6">
      <button
        onClick={() => router.push(createPageURL(currentPage - 1))}
        disabled={currentPage <= 1}
        className={`${buttonBase} glass-card !border-border-subtle text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer`}
      >
        <span className="sr-only">Previous</span>
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>

      {getVisiblePages().map((page, index) => (
        page === -1 ? (
          <span key={`ellipsis-${index}`} className="flex items-center justify-center px-2 text-text-tertiary">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => router.push(createPageURL(page))}
            className={`${buttonBase} cursor-pointer ${
              currentPage === page
                ? 'btn-gradient shadow-md shadow-accent-violet/20 -translate-y-0.5'
                : 'glass-card !border-border-subtle text-text-secondary hover:text-text-primary'
            }`}
          >
            {page}
          </button>
        )
      ))}

      <button
        onClick={() => router.push(createPageURL(currentPage + 1))}
        disabled={currentPage >= totalPages}
        className={`${buttonBase} glass-card !border-border-subtle text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer`}
      >
        <span className="sr-only">Next</span>
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  )
}
