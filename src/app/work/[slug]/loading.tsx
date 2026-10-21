import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectDetailLoading() {
  return (
    <div className="min-h-screen bg-[#080808] text-[#D0D0CE] py-16 px-5 sm:px-8 lg:px-12 2xl:px-20 relative overflow-hidden font-sans">
      <div className="max-w-5xl 2xl:max-w-6xl 3xl:max-w-7xl mx-auto space-y-14 relative z-10 text-left">
        {/* Navigation Return Link */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-48 rounded bg-white/[0.04]" />
        </div>

        {/* Hero Header Sequence */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-5 w-28 rounded bg-white/[0.06]" />
            <Skeleton className="h-5 w-24 rounded bg-white/[0.04]" />
            <Skeleton className="h-4 w-32 rounded bg-white/[0.03]" />
          </div>

          <div className="space-y-3">
            <Skeleton className="h-12 sm:h-16 w-11/12 rounded-xl bg-white/[0.08]" />
            <Skeleton className="h-12 sm:h-16 w-3/5 rounded-xl bg-white/[0.06]" />
          </div>

          <div className="space-y-2 max-w-3xl">
            <Skeleton className="h-4 w-full bg-white/[0.03]" />
            <Skeleton className="h-4 w-5/6 bg-white/[0.03]" />
          </div>

          {/* Tags & Demo Buttons Row */}
          <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-white/[0.06]">
            <div className="flex flex-wrap items-center gap-2">
              {[1, 2, 3, 4, 5].map((t) => (
                <Skeleton key={t} className="h-6 w-20 rounded bg-white/[0.03]" />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-32 rounded-lg bg-white/[0.08]" />
              <Skeleton className="h-9 w-36 rounded-lg bg-white/[0.04]" />
            </div>
          </div>
        </div>

        {/* Hero Cover Image Placeholder (Crucial: prevents 560px CLS displacement) */}
        <div className="w-full h-[280px] sm:h-[440px] md:h-[520px] rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl bg-[#0D0D0D]">
          <Skeleton className="w-full h-full rounded-none bg-white/[0.03]" />
        </div>

        {/* Technical Architecture & Scope Container */}
        <div className="bg-[#0D0D0D] border border-white/[0.08] rounded-2xl p-8 sm:p-12 space-y-6 shadow-2xl">
          <div className="flex items-center gap-3 pb-2">
            <Skeleton className="w-6 h-6 rounded bg-white/[0.06]" />
            <Skeleton className="h-6 w-72 rounded bg-white/[0.07]" />
          </div>

          <div className="space-y-3 pt-2">
            <Skeleton className="h-3.5 w-full bg-white/[0.03]" />
            <Skeleton className="h-3.5 w-11/12 bg-white/[0.03]" />
            <Skeleton className="h-3.5 w-5/6 bg-white/[0.03]" />
            <Skeleton className="h-3.5 w-4/5 bg-white/[0.03]" />
          </div>
        </div>
      </div>
    </div>
  );
}
