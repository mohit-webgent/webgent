import { Skeleton } from "@/components/ui/skeleton";

export default function ServicesLoading() {
  return (
    <div className="relative min-h-screen bg-[#070707] text-[#F5F5F3] pt-12 sm:pt-20 pb-24 overflow-hidden font-sans">
      <div className="max-w-[1760px] 2xl:max-w-[1920px] 3xl:max-w-[2240px] w-full mx-auto px-5 sm:px-8 lg:px-12 2xl:px-16 3xl:px-24">
        {/* Header Section */}
        <div className="space-y-4 max-w-3xl mb-16 sm:mb-20">
          <Skeleton className="h-6 w-48 rounded-full bg-white/[0.04]" />
          <div className="space-y-2">
            <Skeleton className="h-10 sm:h-14 lg:h-16 w-11/12 rounded-xl bg-white/[0.08]" />
            <Skeleton className="h-10 sm:h-14 lg:h-16 w-3/4 rounded-xl bg-white/[0.06]" />
          </div>
          <div className="space-y-2 pt-2 max-w-2xl">
            <Skeleton className="h-4 w-full bg-white/[0.03]" />
            <Skeleton className="h-4 w-4/5 bg-white/[0.03]" />
          </div>
        </div>

        {/* Services Grid (2 Columns matching ServicesView) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 lg:gap-10">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="relative rounded-2xl bg-[#0D0D0D] border border-white/[0.08] p-7 sm:p-9 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-6">
                {/* Top ribbon: Icon & Price badge */}
                <div className="flex items-start justify-between gap-4">
                  <Skeleton className="w-12 h-12 rounded-xl bg-white/[0.06]" />
                  <Skeleton className="h-6 w-32 rounded-full bg-white/[0.04]" />
                </div>

                {/* Title & Description */}
                <div className="space-y-2">
                  <Skeleton className="h-7 w-3/4 rounded-lg bg-white/[0.08]" />
                  <div className="space-y-1.5 pt-1">
                    <Skeleton className="h-3.5 w-full bg-white/[0.03]" />
                    <Skeleton className="h-3.5 w-11/12 bg-white/[0.03]" />
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3 pt-3 border-t border-white/[0.06]">
                  {[1, 2, 3, 4].map((f) => (
                    <div key={f} className="flex items-start gap-3">
                      <Skeleton className="w-4 h-4 rounded bg-white/[0.06] shrink-0 mt-0.5" />
                      <div className="space-y-1 w-full">
                        <Skeleton className="h-3.5 w-3/5 bg-white/[0.04]" />
                        <Skeleton className="h-3 w-4/5 bg-white/[0.02]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer: Starting Rate & Buttons */}
              <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <Skeleton className="h-3 w-16 bg-white/[0.03]" />
                  <Skeleton className="h-6 w-24 bg-white/[0.07]" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-28 rounded-xl bg-white/[0.04]" />
                  <Skeleton className="h-10 w-36 rounded-xl bg-white/[0.08]" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Banner Skeleton */}
        <div className="relative rounded-3xl bg-[#0D0D0D] border border-white/[0.08] p-8 sm:p-14 mt-20 text-center space-y-4">
          <Skeleton className="h-8 sm:h-10 w-1/2 max-w-lg mx-auto rounded-xl bg-white/[0.08]" />
          <Skeleton className="h-4 w-1/3 max-w-md mx-auto rounded bg-white/[0.03]" />
          <div className="flex justify-center gap-3 pt-2">
            <Skeleton className="h-11 w-40 rounded-xl bg-white/[0.10]" />
            <Skeleton className="h-11 w-40 rounded-xl bg-white/[0.04]" />
          </div>
        </div>
      </div>
    </div>
  );
}
