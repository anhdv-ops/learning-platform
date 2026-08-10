export default function CoursesLoading() {
  return (
    <div className="min-h-screen pb-24">
      {/* Header Skeleton */}
      <header className="pt-10 pb-8 px-6 lg:px-8 max-w-[1400px] mx-auto">
        <div className="max-w-2xl w-full">
          <div className="h-8 w-48 bg-bg-card rounded-xl mb-3 animate-shimmer" />
          <div className="h-5 w-full bg-bg-card rounded-lg animate-shimmer" />
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="px-6 lg:px-8 max-w-[1400px] mx-auto">
        {/* Search Bar Skeleton */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="h-11 flex-grow max-w-md bg-bg-card rounded-xl animate-shimmer border border-border-subtle" />
          <div className="h-11 w-48 bg-bg-card rounded-xl animate-shimmer border border-border-subtle" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col bg-bg-card rounded-[var(--radius-xl)] overflow-hidden h-[340px] border border-border-subtle"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-full aspect-[16/10] bg-bg-tertiary animate-shimmer" />
              <div className="p-5 flex flex-col flex-grow">
                <div className="h-5 bg-bg-tertiary rounded-lg w-3/4 mb-3 animate-shimmer" />
                <div className="h-4 bg-bg-tertiary rounded-lg w-full mb-2 animate-shimmer" />
                <div className="h-4 bg-bg-tertiary rounded-lg w-5/6 animate-shimmer" />
                <div className="mt-auto flex justify-between items-center">
                  <div className="h-4 w-20 bg-bg-tertiary rounded-lg animate-shimmer" />
                  <div className="h-4 w-10 bg-bg-tertiary rounded-lg animate-shimmer" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
