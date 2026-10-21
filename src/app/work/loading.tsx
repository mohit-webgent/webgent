import { Skeleton } from "@/components/ui/skeleton";

export default function WorkLoading() {
  return (
    <div className="min-h-screen bg-[#080808] text-[#EDEDED] pt-8 pb-20 sm:pt-12 sm:pb-28 px-6 sm:px-10 lg:px-16 2xl:px-24 font-sans">
      <div className="w-full max-w-[1760px] 2xl:max-w-[1920px] 3xl:max-w-[2240px] mx-auto">
        {/* Left-Aligned Header Intro */}
        <div className="mb-10 sm:mb-14 space-y-2">
          <Skeleton className="h-9 sm:h-12 w-80 sm:w-96 rounded-xl bg-white/[0.08]" />
          <Skeleton className="h-4 w-full max-w-lg bg-white/[0.03]" />
        </div>

        {/* Responsive Grid of 16:10 Image Showcase Cards (matching WorkPage) */}
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-x-8 gap-y-12 sm:gap-x-12 sm:gap-y-16 lg:gap-x-14 lg:gap-y-20 2xl:gap-x-14 2xl:gap-y-20">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="block">
              {/* Large 16:10 Aspect Ratio Image Container */}
              <div className="w-full aspect-[16/10] rounded-none bg-[#121212] border border-white/[0.08] relative overflow-hidden">
                <Skeleton className="w-full h-full rounded-none bg-white/[0.03]" />
                {/* Top-left corner badge */}
                <div className="absolute top-3 left-3">
                  <Skeleton className="h-5 w-24 rounded bg-white/[0.08]" />
                </div>
              </div>

              {/* Title & Metadata below image */}
              <div className="mt-5 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                  <Skeleton className="h-6 w-48 sm:w-60 rounded-lg bg-white/[0.08]" />
                  <Skeleton className="h-4 w-16 rounded bg-white/[0.04]" />
                </div>
                <Skeleton className="h-4 w-24 rounded bg-white/[0.03] shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
