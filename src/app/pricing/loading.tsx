import { Skeleton } from "@/components/ui/skeleton";

export default function PricingLoading() {
  return (
    <div className="min-h-screen bg-[#080808] text-[#DCDCDA] pt-6 pb-28 sm:pb-20 px-3 sm:px-6 lg:px-10 2xl:px-16 3xl:px-24 font-sans">
      <div className="w-full max-w-[1760px] 2xl:max-w-[1920px] 3xl:max-w-[2240px] mx-auto space-y-6 sm:space-y-8 relative z-10">
        {/* Top Header & Page Navigation */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="space-y-2">
            <Skeleton className="h-5 w-36 rounded-full bg-white/[0.05]" />
            <Skeleton className="h-9 sm:h-11 w-80 sm:w-96 rounded-xl bg-white/[0.08]" />
            <div className="space-y-1.5 pt-1 max-w-2xl">
              <Skeleton className="h-3.5 w-full bg-white/[0.03]" />
              <Skeleton className="h-3.5 w-4/5 bg-white/[0.03]" />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Skeleton className="h-10 w-20 rounded-xl bg-white/[0.04]" />
            <Skeleton className="h-10 w-20 rounded-xl bg-white/[0.04]" />
          </div>
        </header>

        {/* STEP 1: How Do You Want to Build? (2 Flow Mode Cards) */}
        <section aria-label="Loading Build Mode" className="space-y-3">
          <Skeleton className="h-4 w-72 rounded bg-white/[0.04]" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="p-4 sm:p-5 rounded-2xl bg-[#0D0D10] border border-white/[0.08] flex items-start gap-3.5"
              >
                <Skeleton className="w-10 h-10 rounded-xl bg-white/[0.06] shrink-0" />
                <div className="space-y-1.5 min-w-0 w-full">
                  <Skeleton className="h-4 w-40 rounded bg-white/[0.06]" />
                  <Skeleton className="h-3 w-4/5 rounded bg-white/[0.03]" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* STEP 2: Base Package Tiers (3 Cards) */}
        <section aria-label="Loading Packages" className="space-y-3">
          <Skeleton className="h-4 w-60 rounded bg-white/[0.04]" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 items-stretch">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-[#0D0D10] border border-white/[0.08] p-5 sm:p-6 space-y-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-32 rounded-lg bg-white/[0.07]" />
                    <Skeleton className="h-5 w-20 rounded-full bg-white/[0.04]" />
                  </div>
                  <Skeleton className="h-3.5 w-4/5 rounded bg-white/[0.03]" />
                  <div className="space-y-1 pt-2">
                    <Skeleton className="h-8 w-36 rounded-md bg-white/[0.09]" />
                    <Skeleton className="h-3 w-28 rounded bg-white/[0.03]" />
                  </div>
                  <div className="space-y-2.5 pt-4 border-t border-white/[0.06]">
                    {[1, 2, 3, 4].map((f) => (
                      <div key={f} className="flex items-center gap-2">
                        <Skeleton className="w-3.5 h-3.5 rounded bg-white/[0.05]" />
                        <Skeleton className="h-3.5 w-4/5 bg-white/[0.03]" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.06]">
                  <Skeleton className="h-10 w-full rounded-xl bg-white/[0.08]" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Matrix Filter Header */}
        <section aria-label="Loading Feature Matrix" className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0D0D10] border border-white/[0.08]">
            <Skeleton className="h-9 w-64 rounded-xl bg-white/[0.04]" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded-lg bg-white/[0.04]" />
              <Skeleton className="h-8 w-24 rounded-lg bg-white/[0.04]" />
            </div>
          </div>
        </section>

        {/* Floating Price Summary Bar Skeleton */}
        <div className="fixed bottom-0 inset-x-0 bg-[#0A0A0C]/95 border-t border-white/[0.12] z-40 py-3.5 px-4 sm:px-8">
          <div className="max-w-[1760px] 2xl:max-w-[1920px] 3xl:max-w-[2240px] mx-auto flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Skeleton className="h-3 w-24 bg-white/[0.04]" />
              <Skeleton className="h-6 w-32 bg-white/[0.08]" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-28 rounded-xl bg-white/[0.04]" />
              <Skeleton className="h-10 w-36 rounded-xl bg-white/[0.10]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
