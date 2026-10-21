import { Skeleton } from "@/components/ui/skeleton";

export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-[#080808] text-[#E0E0DE] pt-10 pb-24 sm:pt-14 sm:pb-32 px-5 sm:px-8 lg:px-14 2xl:px-24 font-sans">
      <div className="w-full max-w-[1760px] 2xl:max-w-[1920px] 3xl:max-w-[2240px] mx-auto space-y-10 sm:space-y-12">
        {/* Left-Aligned Top Header */}
        <div className="space-y-2">
          <Skeleton className="h-8 sm:h-9 w-64 rounded-xl bg-white/[0.08]" />
          <Skeleton className="h-4 w-full max-w-md bg-white/[0.03]" />
        </div>

        {/* 12-Column Asymmetric Editorial Split (matching BlogPage) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Left Column (Large Featured Article) */}
          <div className="lg:col-span-6 space-y-4">
            {/* 16:11 Aspect Ratio Featured Image */}
            <div className="w-full aspect-[16/11] bg-[#121212] rounded-xl overflow-hidden border border-white/[0.08]">
              <Skeleton className="w-full h-full rounded-none bg-white/[0.03]" />
            </div>

            <div className="space-y-3 pt-1">
              <Skeleton className="h-3.5 w-44 rounded bg-white/[0.04]" />
              <div className="space-y-1.5">
                <Skeleton className="h-7 w-11/12 rounded-lg bg-white/[0.08]" />
                <Skeleton className="h-7 w-3/4 rounded-lg bg-white/[0.06]" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-full bg-white/[0.03]" />
                <Skeleton className="h-3.5 w-5/6 bg-white/[0.03]" />
              </div>
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-6 w-20 rounded-full bg-white/[0.04]" />
                <Skeleton className="h-6 w-24 rounded-full bg-white/[0.04]" />
              </div>
            </div>
          </div>

          {/* Right Column (3 Stacked Horizontal Articles) */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-8 lg:gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row gap-5 items-start"
              >
                {/* Horizontal Thumbnail */}
                <div className="w-full sm:w-56 md:w-60 shrink-0 aspect-[16/10] sm:aspect-[4/3] bg-[#121212] rounded-xl overflow-hidden border border-white/[0.08]">
                  <Skeleton className="w-full h-full rounded-none bg-white/[0.03]" />
                </div>

                {/* Content */}
                <div className="space-y-2 min-w-0 w-full pt-1">
                  <Skeleton className="h-3 w-36 rounded bg-white/[0.04]" />
                  <Skeleton className="h-5 w-4/5 rounded bg-white/[0.07]" />
                  <div className="space-y-1 pt-1">
                    <Skeleton className="h-3 w-full bg-white/[0.03]" />
                    <Skeleton className="h-3 w-3/4 bg-white/[0.03]" />
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    <Skeleton className="h-5 w-16 rounded-full bg-white/[0.04]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
