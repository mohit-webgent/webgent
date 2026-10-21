import { Skeleton } from "@/components/ui/skeleton";

export default function AboutLoading() {
  return (
    <div className="min-h-screen bg-[#080808] text-[#EDEDED] pt-8 pb-24 sm:pt-12 sm:pb-32 px-4 sm:px-8 lg:px-12 font-sans selection:bg-white selection:text-black">
      <div className="w-full max-w-6xl mx-auto space-y-20 sm:space-y-28">
        {/* 1. HERO DEVELOPER PROFILE SKELETON */}
        <section aria-label="Loading Developer Profile" className="pt-2 sm:pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            {/* Left Column: Developer Narrative */}
            <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
              <div className="space-y-5">
                {/* Sharp non-rounded architectural badge */}
                <Skeleton className="h-7 w-48 rounded-none bg-white/[0.05] border-white/[0.08]" />

                <div className="space-y-2.5">
                  <Skeleton className="h-12 sm:h-14 lg:h-16 w-3/4 rounded-xl bg-white/[0.08]" />
                  <Skeleton className="h-5 w-1/2 rounded bg-white/[0.05]" />
                </div>

                <div className="space-y-3 pt-1">
                  <Skeleton className="h-4 w-full bg-white/[0.03]" />
                  <Skeleton className="h-4 w-11/12 bg-white/[0.03]" />
                  <Skeleton className="h-4 w-4/5 bg-white/[0.03]" />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 pt-4">
                <Skeleton className="h-10 w-36 rounded-lg bg-white/[0.08]" />
                <Skeleton className="h-10 w-32 rounded-lg bg-white/[0.04]" />
              </div>
            </div>

            {/* Right Column: Sharp Developer Portrait */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <Skeleton className="w-full max-w-md aspect-[4/5] rounded-none bg-[#0D0D0D] border border-white/[0.08]" />
            </div>
          </div>
        </section>

        {/* 2. CORE PRINCIPLES SKELETON */}
        <section aria-label="Loading Principles" className="space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 rounded bg-white/[0.04]" />
            <Skeleton className="h-8 sm:h-10 w-64 rounded-xl bg-white/[0.07]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-6 bg-[#0D0D0D] border border-white/[0.08] space-y-4"
              >
                <Skeleton className="w-8 h-8 rounded bg-white/[0.06]" />
                <Skeleton className="h-6 w-3/4 rounded bg-white/[0.07]" />
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-full bg-white/[0.03]" />
                  <Skeleton className="h-3.5 w-5/6 bg-white/[0.03]" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. CAPABILITIES / TECH STACK MATRIX SKELETON */}
        <section aria-label="Loading Tech Matrix" className="space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-4 w-36 rounded bg-white/[0.04]" />
            <Skeleton className="h-8 sm:h-10 w-72 rounded-xl bg-white/[0.07]" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="p-4 bg-[#0D0D0D] border border-white/[0.08] flex items-center gap-3"
              >
                <Skeleton className="w-7 h-7 rounded bg-white/[0.06]" />
                <Skeleton className="h-4 w-20 rounded bg-white/[0.04]" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
