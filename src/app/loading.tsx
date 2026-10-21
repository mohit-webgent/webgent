import { Skeleton } from "@/components/ui/skeleton";

export default function GlobalLoading() {
  return (
    <div className="space-y-12 sm:space-y-16 lg:space-y-20 pb-12 sm:pb-20 max-w-[1760px] 2xl:max-w-[1920px] 3xl:max-w-[2240px] mx-auto px-3.5 sm:px-8 lg:px-12 2xl:px-16 3xl:px-24 font-sans w-full pt-4 sm:pt-8">
      {/* 1. HERO SECTION SKELETON */}
      <section aria-label="Loading Hero" className="space-y-8 sm:space-y-10 text-center max-w-4xl mx-auto pt-6 sm:pt-10">
        {/* Status Pill */}
        <div className="inline-flex justify-center">
          <Skeleton className="h-7 w-56 rounded-full bg-white/[0.05]" />
        </div>

        {/* Display Typography */}
        <div className="space-y-3 sm:space-y-4">
          <Skeleton className="h-12 sm:h-16 lg:h-20 w-4/5 mx-auto rounded-2xl bg-white/[0.08]" />
          <Skeleton className="h-10 sm:h-14 lg:h-16 w-3/5 mx-auto rounded-2xl bg-white/[0.06]" />
        </div>

        {/* Subtitle */}
        <div className="space-y-2 max-w-xl mx-auto">
          <Skeleton className="h-4 w-full bg-white/[0.03]" />
          <Skeleton className="h-4 w-4/5 mx-auto bg-white/[0.03]" />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <Skeleton className="h-12 w-44 rounded-xl bg-white/[0.12]" />
          <Skeleton className="h-12 w-44 rounded-xl bg-white/[0.04]" />
        </div>

        {/* Interactive 3D / Device Frame Preview */}
        <div className="pt-8 sm:pt-12">
          <div className="w-full aspect-[16/9] max-w-5xl mx-auto rounded-2xl bg-[#0D0D0D] border border-white/[0.08] p-4 sm:p-6 flex flex-col justify-between shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Skeleton className="w-3 h-3 rounded-full bg-white/[0.10]" />
                <Skeleton className="w-3 h-3 rounded-full bg-white/[0.08]" />
                <Skeleton className="w-3 h-3 rounded-full bg-white/[0.06]" />
              </div>
              <Skeleton className="h-4 w-48 rounded bg-white/[0.04]" />
              <Skeleton className="h-5 w-20 rounded bg-white/[0.06]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-auto py-6">
              <Skeleton className="h-32 rounded-xl bg-white/[0.03]" />
              <Skeleton className="h-32 rounded-xl bg-white/[0.04]" />
              <Skeleton className="h-32 rounded-xl bg-white/[0.03]" />
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
              <Skeleton className="h-4 w-32 bg-white/[0.04]" />
              <Skeleton className="h-4 w-24 bg-white/[0.04]" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE CAPABILITIES GRID SKELETON */}
      <section aria-label="Loading Capabilities" className="space-y-6 pt-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32 rounded bg-white/[0.04]" />
            <Skeleton className="h-8 sm:h-10 w-72 rounded-xl bg-white/[0.07]" />
          </div>
          <Skeleton className="h-4 w-48 rounded bg-white/[0.03]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-[#0D0D0D] border border-white/[0.08] p-6 sm:p-7 space-y-5"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="w-10 h-10 rounded-xl bg-white/[0.06]" />
                <Skeleton className="h-5 w-16 rounded-md bg-white/[0.04]" />
              </div>
              <Skeleton className="h-6 w-3/4 rounded-lg bg-white/[0.07]" />
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-full bg-white/[0.03]" />
                <Skeleton className="h-3.5 w-4/5 bg-white/[0.03]" />
              </div>
              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <Skeleton className="h-4 w-24 bg-white/[0.04]" />
                <Skeleton className="w-4 h-4 rounded bg-white/[0.04]" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED WORK SKELETON */}
      <section aria-label="Loading Featured Projects" className="space-y-6 pt-8">
        <div className="space-y-2">
          <Skeleton className="h-5 w-36 rounded bg-white/[0.04]" />
          <Skeleton className="h-8 sm:h-10 w-64 rounded-xl bg-white/[0.07]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="w-full aspect-[16/10] rounded-xl bg-[#0E0E10] border border-white/[0.08]" />
              <div className="flex items-center justify-between gap-3 pt-1">
                <Skeleton className="h-6 w-1/2 rounded-lg bg-white/[0.07]" />
                <Skeleton className="h-4 w-20 rounded bg-white/[0.04]" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. CTA BANNER SKELETON */}
      <section aria-label="Loading CTA" className="rounded-2xl bg-[#0D0D0D] border border-white/[0.08] p-8 sm:p-12 text-center space-y-5">
        <Skeleton className="h-8 sm:h-10 w-2/3 max-w-md mx-auto rounded-xl bg-white/[0.08]" />
        <Skeleton className="h-4 w-1/2 max-w-sm mx-auto rounded bg-white/[0.04]" />
        <div className="flex justify-center gap-3 pt-3">
          <Skeleton className="h-11 w-36 rounded-lg bg-white/[0.10]" />
          <Skeleton className="h-11 w-36 rounded-lg bg-white/[0.04]" />
        </div>
      </section>
    </div>
  );
}
