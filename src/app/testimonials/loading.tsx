export default function TestimonialsLoading() {
  return (
    <div className="min-h-screen bg-[#080808] text-[#D0D0CE] py-16 px-5 sm:px-8 lg:px-12 relative overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto space-y-16 animate-pulse">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="h-6 w-48 bg-white/[0.04] border border-white/[0.08] rounded-md mx-auto" />
          <div className="h-10 sm:h-12 w-3/4 bg-white/[0.06] border border-white/[0.07] rounded-xl mx-auto" />
          <div className="h-3.5 w-2/3 bg-white/[0.03] rounded mx-auto" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-5 rounded-xl bg-[#0D0D0D] border border-white/[0.08] space-y-2"
            >
              <div className="h-7 w-16 bg-white/[0.06] rounded" />
              <div className="h-3 w-28 bg-white/[0.03] rounded" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-[#0D0D0D] border border-white/[0.08] rounded-xl p-6 sm:p-7 space-y-5 h-72 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className="w-3.5 h-3.5 bg-white/[0.05] rounded-sm" />
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="h-3.5 w-full bg-white/[0.03] rounded" />
                  <div className="h-3.5 w-11/12 bg-white/[0.03] rounded" />
                  <div className="h-3.5 w-4/5 bg-white/[0.03] rounded" />
                </div>
              </div>
              <div className="pt-4 border-t border-white/[0.06] flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/[0.08] shrink-0" />
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="h-3.5 w-24 bg-white/[0.06] rounded" />
                  <div className="h-2.5 w-32 bg-white/[0.03] rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
