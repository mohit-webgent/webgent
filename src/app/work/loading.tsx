export default function WorkLoading() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto space-y-16 animate-pulse">
        {/* Header Skeleton */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="h-6 w-48 bg-slate-900 border border-slate-800 rounded-full mx-auto" />
          <div className="h-12 w-3/4 bg-slate-800/80 rounded-2xl mx-auto" />
          <div className="h-4 w-2/3 bg-slate-800/50 rounded-lg mx-auto" />
        </div>

        {/* Filter Pills & Search Skeleton */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 w-24 bg-slate-900 border border-slate-800 rounded-xl" />
            ))}
          </div>
          <div className="h-9 w-64 bg-slate-900 border border-slate-800 rounded-xl" />
        </div>

        {/* Projects Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 h-72 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-4 w-20 bg-slate-800 rounded-full" />
                <div className="h-6 w-3/4 bg-slate-800 rounded-lg" />
                <div className="h-3 w-full bg-slate-800/50 rounded" />
                <div className="h-3 w-5/6 bg-slate-800/50 rounded" />
              </div>
              <div className="h-8 w-28 bg-slate-800 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
