export default function ProjectDetailLoading() {
  return (
    <div className="min-h-screen bg-[#080808] text-[#D0D0CE] py-16 px-5 sm:px-8 lg:px-12 relative overflow-hidden font-sans">
      <div className="max-w-5xl mx-auto space-y-12 animate-pulse">
        <div className="h-4 w-36 bg-white/[0.04] border border-white/[0.08] rounded" />

        <div className="space-y-6">
          <div className="flex gap-2.5">
            <div className="h-5 w-24 bg-white/[0.03] border border-white/[0.07] rounded" />
            <div className="h-5 w-32 bg-white/[0.03] border border-white/[0.07] rounded" />
          </div>

          <div className="h-12 sm:h-16 w-3/4 bg-white/[0.06] border border-white/[0.08] rounded-xl" />
          <div className="space-y-2 max-w-3xl">
            <div className="h-4 w-full bg-white/[0.03] rounded" />
            <div className="h-4 w-4/5 bg-white/[0.03] rounded" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-white/[0.07]">
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-6 w-20 bg-white/[0.03] border border-white/[0.06] rounded"
                />
              ))}
            </div>
            <div className="h-9 w-36 bg-white/[0.08] rounded-lg" />
          </div>
        </div>

        <div className="bg-[#0D0D0D] border border-white/[0.08] rounded-xl p-6 sm:p-10 space-y-6">
          <div className="h-6 w-56 bg-white/[0.05] rounded" />
          <div className="space-y-3">
            <div className="h-3.5 w-full bg-white/[0.03] rounded" />
            <div className="h-3.5 w-11/12 bg-white/[0.03] rounded" />
            <div className="h-3.5 w-5/6 bg-white/[0.03] rounded" />
            <div className="h-3.5 w-4/5 bg-white/[0.03] rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
