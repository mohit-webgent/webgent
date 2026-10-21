import { Skeleton } from "@/components/ui/skeleton";

export default function BlogPostDetailLoading() {
  return (
    <div className="min-h-screen bg-[#080808] text-[#D0D0CE] py-16 px-5 sm:px-8 lg:px-12 2xl:px-20 relative overflow-hidden font-sans">
      <div className="max-w-4xl 2xl:max-w-5xl 3xl:max-w-6xl mx-auto space-y-12 relative z-10 text-left">
        {/* Navigation Return Link */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-44 rounded bg-white/[0.04]" />
        </div>

        {/* Header Sequence */}
        <div className="space-y-6">
          {/* Category & Metadata (Date, Read Time, Views) */}
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-5 w-24 rounded bg-white/[0.06]" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-28 rounded bg-white/[0.03]" />
              <Skeleton className="h-4 w-20 rounded bg-white/[0.03]" />
              <Skeleton className="h-4 w-16 rounded bg-white/[0.03]" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-3">
            <Skeleton className="h-10 sm:h-14 w-11/12 rounded-xl bg-white/[0.08]" />
            <Skeleton className="h-10 sm:h-14 w-3/4 rounded-xl bg-white/[0.06]" />
          </div>

          {/* Author Badge */}
          <div className="flex items-center gap-3 pt-2">
            <Skeleton className="w-9 h-9 rounded-lg bg-white/[0.06]" />
            <div className="space-y-1">
              <Skeleton className="h-3.5 w-28 bg-white/[0.06] rounded" />
              <Skeleton className="h-3 w-40 bg-white/[0.03] rounded" />
            </div>
          </div>
        </div>

        {/* Cover Image Placeholder (Crucial: matches real 500px max height to prevent CLS) */}
        <div className="w-full h-[260px] sm:h-[400px] md:h-[480px] rounded-xl overflow-hidden border border-white/[0.08] shadow-2xl bg-[#0D0D0D]">
          <Skeleton className="w-full h-full rounded-none bg-white/[0.03]" />
        </div>

        {/* Article Content Container */}
        <div className="bg-[#0D0D0D] border border-white/[0.08] rounded-2xl p-8 sm:p-12 space-y-6 shadow-2xl">
          <div className="space-y-3">
            <Skeleton className="h-4 w-full bg-white/[0.03]" />
            <Skeleton className="h-4 w-11/12 bg-white/[0.03]" />
            <Skeleton className="h-4 w-4/5 bg-white/[0.03]" />
            <Skeleton className="h-4 w-5/6 bg-white/[0.03]" />
            <Skeleton className="h-4 w-full bg-white/[0.03]" />
          </div>
          <div className="pt-4 space-y-3 border-t border-white/[0.06]">
            <Skeleton className="h-6 w-48 rounded bg-white/[0.06]" />
            <Skeleton className="h-4 w-full bg-white/[0.03]" />
            <Skeleton className="h-4 w-4/5 bg-white/[0.03]" />
          </div>
        </div>

        {/* Related Articles Section */}
        <div className="space-y-6 pt-6 border-t border-white/[0.06]">
          <Skeleton className="h-6 w-60 rounded bg-white/[0.06]" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((r) => (
              <div
                key={r}
                className="bg-[#0D0D0D] border border-white/[0.08] rounded-xl p-5 space-y-3 h-44 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16 rounded bg-white/[0.04]" />
                  <Skeleton className="h-5 w-4/5 rounded bg-white/[0.06]" />
                </div>
                <div className="pt-3 border-t border-white/[0.06] flex justify-between items-center">
                  <Skeleton className="h-3.5 w-24 bg-white/[0.04]" />
                  <Skeleton className="h-3 w-10 bg-white/[0.03]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Card Skeleton */}
        <div className="pt-6">
          <div className="rounded-2xl bg-[#0D0D0D] border border-white/[0.08] p-6 sm:p-8 space-y-4">
            <Skeleton className="h-6 w-72 rounded bg-white/[0.07]" />
            <Skeleton className="h-3.5 w-3/5 rounded bg-white/[0.03]" />
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Skeleton className="h-11 w-full sm:w-72 rounded-xl bg-white/[0.04]" />
              <Skeleton className="h-11 w-32 rounded-xl bg-white/[0.08]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
