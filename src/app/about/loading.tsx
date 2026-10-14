export default function AboutLoading() {
  return (
    <div className="min-h-screen bg-[#080808] text-[#D0D0CE] py-12 px-4 sm:px-6 lg:px-12 2xl:px-24 relative overflow-hidden font-sans">
      <div className="w-full max-w-[1760px] 2xl:max-w-[1920px] 3xl:max-w-[2240px] mx-auto space-y-16 animate-pulse">
        {/* Hero Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="h-6 w-36 bg-white/[0.04] rounded-full" />
            <div className="h-12 w-3/4 bg-white/[0.06] rounded-xl" />
            <div className="h-4 w-1/2 bg-white/[0.04] rounded" />
            <div className="space-y-2 pt-2">
              <div className="h-3.5 w-full bg-white/[0.03] rounded" />
              <div className="h-3.5 w-5/6 bg-white/[0.03] rounded" />
              <div className="h-3.5 w-4/6 bg-white/[0.03] rounded" />
            </div>
            <div className="flex gap-3 pt-4">
              <div className="h-10 w-36 bg-white/[0.08] rounded-xl" />
              <div className="h-10 w-32 bg-white/[0.04] rounded-xl" />
            </div>
          </div>
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md aspect-[4/5] bg-white/[0.03] border border-white/[0.06] rounded-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
