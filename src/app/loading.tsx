export default function GlobalLoading() {
  return (
    <div className="min-h-[75vh] max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 space-y-16 animate-pulse font-sans bg-[#080808]">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <div className="h-6 w-48 bg-white/[0.04] border border-white/[0.08] rounded-md mx-auto" />
        <div className="h-12 sm:h-14 w-3/4 bg-white/[0.06] border border-white/[0.07] rounded-xl mx-auto" />
        <div className="space-y-2 max-w-lg mx-auto">
          <div className="h-3.5 w-full bg-white/[0.03] rounded" />
          <div className="h-3.5 w-4/5 bg-white/[0.03] rounded mx-auto" />
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <div className="h-10 w-36 bg-white/[0.08] rounded-lg" />
          <div className="h-10 w-36 bg-white/[0.02] border border-white/[0.10] rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-64 rounded-xl bg-[#0D0D0D] border border-white/[0.08] p-6 space-y-5 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 bg-white/[0.05] rounded" />
                <div className="h-3 w-14 bg-white/[0.03] rounded" />
              </div>
              <div className="h-6 w-3/4 bg-white/[0.06] rounded" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-white/[0.03] rounded" />
                <div className="h-3 w-4/5 bg-white/[0.03] rounded" />
              </div>
            </div>
            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
              <div className="h-4 w-24 bg-white/[0.05] rounded" />
              <div className="h-4 w-4 bg-white/[0.04] rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
