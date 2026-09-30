export default function GlobalLoading() {
  return (
    <div className="min-h-[70vh] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 animate-pulse font-sans">
      {/* Hero Skeleton */}
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <div className="h-6 w-48 bg-slate-900 border border-slate-800 rounded-full mx-auto" />
        <div className="h-12 sm:h-16 w-3/4 bg-slate-800/80 rounded-2xl mx-auto" />
        <div className="h-4 w-5/6 bg-slate-800/50 rounded-lg mx-auto" />
        <div className="h-4 w-2/3 bg-slate-800/50 rounded-lg mx-auto" />
        <div className="flex justify-center gap-4 pt-4">
          <div className="h-11 w-36 bg-slate-800 rounded-xl" />
          <div className="h-11 w-36 bg-slate-900 border border-slate-800 rounded-xl" />
        </div>
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-10">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-64 rounded-3xl bg-slate-900/60 border border-slate-800/80 p-6 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="h-4 w-24 bg-slate-800 rounded-full" />
              <div className="h-6 w-3/4 bg-slate-800 rounded-lg" />
              <div className="h-3 w-full bg-slate-800/60 rounded" />
              <div className="h-3 w-4/5 bg-slate-800/60 rounded" />
            </div>
            <div className="h-8 w-28 bg-slate-800/80 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
