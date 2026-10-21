import { Skeleton } from "@/components/ui/skeleton";

export default function TestimonialsLoading() {
  return (
    <div className="min-h-screen bg-[#080808] text-[#DCDCDA] pt-12 pb-24 px-5 sm:px-8 2xl:px-20 w-full max-w-[1760px] 2xl:max-w-[1920px] 3xl:max-w-[2240px] mx-auto space-y-8 font-sans">
      {/* Left-Aligned Header Sequence */}
      <div className="space-y-2 text-left">
        <Skeleton className="h-9 sm:h-12 w-72 sm:w-80 rounded-xl bg-white/[0.08]" />
        <Skeleton className="h-4 w-64 rounded bg-white/[0.03]" />
      </div>

      {/* 4-Column Testimonial Quote Cards Grid (matching TestimonialsPage) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 text-left">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] space-y-4 shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-full bg-white/[0.04]" />
              <Skeleton className="h-3.5 w-11/12 bg-white/[0.04]" />
              <Skeleton className="h-3.5 w-4/5 bg-white/[0.04]" />
            </div>

            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Skeleton className="w-6 h-6 rounded-full bg-white/[0.06]" />
                <Skeleton className="h-3.5 w-24 rounded bg-white/[0.05]" />
              </div>
              <Skeleton className="h-3 w-16 rounded bg-white/[0.03]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
