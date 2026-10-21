import { Skeleton, StatCardSkeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-200 font-sans">
      {/* Top Header Banner Skeleton */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40 rounded-full bg-indigo-500/10 border-indigo-500/20" />
            <Skeleton className="h-8 sm:h-9 w-64 rounded-xl bg-white/[0.08]" />
            <Skeleton className="h-3.5 w-80 sm:w-96 rounded bg-white/[0.03]" />
          </div>

          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-28 rounded-xl bg-slate-800 border-slate-700" />
            <Skeleton className="h-10 w-32 rounded-xl bg-indigo-600/40" />
          </div>
        </div>
      </div>

      {/* KPI Stats Row (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Filter and Search Bar Skeleton */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-lg bg-slate-800" />
          <Skeleton className="h-8 w-24 rounded-lg bg-slate-800" />
          <Skeleton className="h-8 w-20 rounded-lg bg-slate-800" />
        </div>
        <Skeleton className="h-9 w-full sm:w-64 rounded-xl bg-slate-950 border border-slate-800" />
      </div>

      {/* Content Table Container Skeleton */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <Skeleton className="h-4 w-32 bg-slate-700" />
          <Skeleton className="h-4 w-20 bg-slate-700" />
        </div>
        <div className="divide-y divide-slate-800/60 p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3 w-1/3">
                <Skeleton className="w-8 h-8 rounded-full bg-slate-800" />
                <div className="space-y-1 w-3/4">
                  <Skeleton className="h-4 w-full bg-white/[0.06]" />
                  <Skeleton className="h-3 w-1/2 bg-white/[0.03]" />
                </div>
              </div>
              <Skeleton className="h-4 w-24 rounded bg-white/[0.04]" />
              <Skeleton className="h-5 w-16 rounded bg-white/[0.04]" />
              <Skeleton className="h-4 w-28 rounded bg-white/[0.03]" />
              <Skeleton className="h-8 w-16 rounded-lg bg-slate-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
