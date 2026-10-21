import { Skeleton } from "@/components/ui/skeleton";

export default function ServiceDetailLoading() {
  return (
    <div className="relative min-h-screen bg-[#070707] text-[#F5F5F3] pt-8 sm:pt-16 pb-24 overflow-hidden font-sans">
      <div className="max-w-[1440px] w-full mx-auto px-5 sm:px-8 lg:px-12">
        {/* Breadcrumb nav */}
        <div className="flex items-center gap-2 text-xs font-mono mb-8 sm:mb-12">
          <Skeleton className="h-3 w-12 bg-white/[0.03]" />
          <span className="text-white/20">/</span>
          <Skeleton className="h-3 w-16 bg-white/[0.03]" />
          <span className="text-white/20">/</span>
          <Skeleton className="h-3 w-32 bg-white/[0.05]" />
        </div>

        {/* Back Link */}
        <div className="mb-8">
          <Skeleton className="h-4 w-40 rounded bg-white/[0.04]" />
        </div>

        {/* 12-Column Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start mb-16">
          {/* Main Detail Area (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Service Icon & Badge */}
            <div className="flex items-center gap-3">
              <Skeleton className="w-14 h-14 rounded-2xl bg-white/[0.06]" />
              <Skeleton className="h-6 w-36 rounded-md bg-white/[0.04]" />
            </div>

            {/* H1 Title */}
            <div className="space-y-2">
              <Skeleton className="h-10 sm:h-14 w-4/5 rounded-xl bg-white/[0.08]" />
              <Skeleton className="h-10 sm:h-14 w-1/2 rounded-xl bg-white/[0.06]" />
            </div>

            {/* Short Description */}
            <div className="space-y-2 pt-1 max-w-2xl">
              <Skeleton className="h-4 w-full bg-white/[0.03]" />
              <Skeleton className="h-4 w-4/5 bg-white/[0.03]" />
            </div>

            {/* Cover Image Placeholder matching exact real height (260px / 380px) */}
            <div className="mt-6">
              <Skeleton className="w-full h-[260px] sm:h-[380px] rounded-2xl bg-[#0D0D0D] border border-white/[0.08]" />
            </div>

            {/* Architecture & Scope Section */}
            <div className="pt-8 border-t border-white/[0.08] space-y-4">
              <Skeleton className="h-6 w-56 rounded bg-white/[0.06]" />
              <div className="space-y-2.5">
                <Skeleton className="h-3.5 w-full bg-white/[0.03]" />
                <Skeleton className="h-3.5 w-11/12 bg-white/[0.03]" />
                <Skeleton className="h-3.5 w-4/5 bg-white/[0.03]" />
              </div>
            </div>

            {/* Features Categories Grid */}
            <div className="pt-8 border-t border-white/[0.08] space-y-6">
              <Skeleton className="h-6 w-64 rounded bg-white/[0.06]" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((f) => (
                  <div
                    key={f}
                    className="p-4 rounded-xl bg-[#0D0D0D] border border-white/[0.08] space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-4 h-4 rounded bg-white/[0.06]" />
                      <Skeleton className="h-4 w-32 bg-white/[0.05]" />
                    </div>
                    <Skeleton className="h-3 w-full bg-white/[0.03]" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Sticky Card (4 Cols) */}
          <div className="lg:col-span-4 sticky top-28 space-y-6">
            <div className="rounded-2xl bg-[#0D0D0D] border border-white/[0.08] p-6 sm:p-7 space-y-6 shadow-xl">
              <div className="space-y-2">
                <Skeleton className="h-3 w-24 bg-white/[0.03]" />
                <Skeleton className="h-8 w-36 bg-white/[0.08]" />
              </div>

              <div className="space-y-3 pt-4 border-t border-white/[0.06]">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-20 bg-white/[0.03]" />
                  <Skeleton className="h-3 w-28 bg-white/[0.04]" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-24 bg-white/[0.03]" />
                  <Skeleton className="h-3 w-16 bg-white/[0.04]" />
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <Skeleton className="h-11 w-full rounded-xl bg-white/[0.10]" />
                <Skeleton className="h-11 w-full rounded-xl bg-white/[0.04]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
