export default function ProjectDetailLoading() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="max-w-5xl mx-auto space-y-12 animate-pulse">
        {/* Back Link Skeleton */}
        <div className="h-4 w-32 bg-slate-900 border border-slate-800 rounded-lg" />

        {/* Header Title Skeleton */}
        <div className="space-y-6">
          <div className="flex gap-3">
            <div className="h-6 w-28 bg-slate-900 border border-slate-800 rounded-full" />
            <div className="h-6 w-36 bg-slate-900 border border-slate-800 rounded-full" />
          </div>

          <div className="h-14 sm:h-20 w-4/5 bg-slate-800/80 rounded-2xl" />
          <div className="h-6 w-full bg-slate-800/50 rounded-lg" />
          <div className="h-6 w-3/4 bg-slate-800/50 rounded-lg" />

          {/* Action Links & Tech Stack Skeleton */}
          <div className="flex flex-wrap items-center justify-between gap-6 pt-4 border-t border-slate-800">
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-7 w-20 bg-slate-900 border border-slate-800 rounded-xl" />
              ))}
            </div>
            <div className="h-10 w-36 bg-slate-800 rounded-xl" />
          </div>
        </div>

        {/* Content Box Skeleton */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-6 h-96">
          <div className="h-8 w-64 bg-slate-800 rounded-xl" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-slate-800/60 rounded" />
            <div className="h-4 w-11/12 bg-slate-800/60 rounded" />
            <div className="h-4 w-5/6 bg-slate-800/60 rounded" />
            <div className="h-4 w-4/5 bg-slate-800/60 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
