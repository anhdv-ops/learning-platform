export default function CoursesLoading() {
  return (
    <div className="min-h-screen pb-24">
      {/* Header Skeleton */}
      <header className="pt-16 pb-12 px-6 lg:px-8 max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="max-w-2xl w-full">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-full mb-4 animate-pulse" />
          <div className="h-10 sm:h-12 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-2xl mb-4 animate-pulse" />
          <div className="h-6 w-full bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        </div>
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
          <div className="h-12 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="px-6 lg:px-8 max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Skeleton */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="h-[400px] bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
          </div>

          {/* Grid Skeleton */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 mb-16">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col bg-slate-100 dark:bg-slate-900/50 rounded-[2rem] overflow-hidden h-[380px] animate-pulse border border-slate-200 dark:border-slate-800">
                  <div className="w-auto aspect-[4/3] bg-slate-200 dark:bg-slate-800 m-2.5 rounded-t-[1.5rem] rounded-b-xl" />
                  <div className="px-5 pt-3 pb-5 flex flex-col flex-grow">
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-3/4 mb-4" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-full mb-2" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-5/6" />
                    <div className="mt-auto flex justify-between items-center">
                       <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                       <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
