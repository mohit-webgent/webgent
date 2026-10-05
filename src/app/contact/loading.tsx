export default function ContactLoading() {
  return (
    <div className="min-h-screen bg-[#080808] text-[#D0D0CE] py-16 px-5 sm:px-8 lg:px-12 relative overflow-hidden font-sans">
      <div className="max-w-4xl mx-auto space-y-12 animate-pulse">
        <div className="text-center space-y-4">
          <div className="h-6 w-56 bg-white/[0.04] border border-white/[0.08] rounded-md mx-auto" />
          <div className="h-10 sm:h-12 w-3/4 bg-white/[0.06] border border-white/[0.07] rounded-xl mx-auto" />
          <div className="h-3.5 w-2/3 bg-white/[0.03] rounded mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="h-4 w-32 bg-white/[0.05] rounded" />
            <div className="p-5 rounded-xl bg-[#0D0D0D] border border-white/[0.08] space-y-4">
              <div className="space-y-2">
                <div className="h-3.5 w-24 bg-white/[0.05] rounded" />
                <div className="h-3 w-40 bg-white/[0.03] rounded" />
              </div>
              <div className="space-y-2 pt-3 border-t border-white/[0.06]">
                <div className="h-3.5 w-24 bg-white/[0.05] rounded" />
                <div className="h-3 w-36 bg-white/[0.03] rounded" />
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-[#0D0D0D] border border-white/[0.08] rounded-xl p-6 sm:p-8 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-3 w-16 bg-white/[0.04] rounded" />
                <div className="h-10 bg-white/[0.02] border border-white/[0.07] rounded-lg" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-16 bg-white/[0.04] rounded" />
                <div className="h-10 bg-white/[0.02] border border-white/[0.07] rounded-lg" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-24 bg-white/[0.04] rounded" />
              <div className="h-10 bg-white/[0.02] border border-white/[0.07] rounded-lg" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-20 bg-white/[0.04] rounded" />
              <div className="h-28 bg-white/[0.02] border border-white/[0.07] rounded-lg" />
            </div>
            <div className="h-11 w-full bg-white/[0.08] rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
