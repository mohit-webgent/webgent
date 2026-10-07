export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-[#080808] text-[#D0D0CE] py-16 px-5 sm:px-8 lg:px-12 relative overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto space-y-16 animate-pulse">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="h-6 w-48 bg-white/[0.04] border border-white/[0.08] rounded-md mx-auto" />
          <div className="h-10 sm:h-12 w-3/4 bg-white/[0.06] border border-white/[0.07] rounded-xl mx-auto" />
          <div className="h-3.5 w-2/3 bg-white/[0.03] rounded mx-auto" />
        </div>

        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-8 w-20 bg-white/[0.03] border border-white/[0.07] rounded-lg"
            />
          ))}
        </div>

        <div className="bg-[#0D0D0D] border border-white/[0.08] rounded-xl p-6 sm:p-10 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="h-4 w-28 bg-white/[0.05] rounded" />
            <div className="h-8 w-2/3 bg-white/[0.06] rounded" />
            <div className="space-y-2">
              <div className="h-3.5 w-full bg-white/[0.03] rounded" />
              <div className="h-3.5 w-4/5 bg-white/[0.03] rounded" />
            </div>
          </div>
          <div className="h-9 w-32 bg-white/[0.06] rounded-lg" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-[#0D0D0D] border border-white/[0.08] rounded-xl p-6 space-y-5 h-72 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-20 bg-white/[0.04] rounded" />
                  <div className="h-3 w-16 bg-white/[0.03] rounded" />
                </div>
                <div className="h-6 w-3/4 bg-white/[0.06] rounded" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-white/[0.03] rounded" />
                  <div className="h-3 w-5/6 bg-white/[0.03] rounded" />
                </div>
              </div>
              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <div className="h-4 w-24 bg-white/[0.05] rounded" />
                <div className="h-3 w-3 bg-white/[0.04] rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
