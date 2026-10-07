export default function BlogPostDetailLoading() {
  return (
    <div className="min-h-screen bg-[#080808] text-[#D0D0CE] py-16 px-5 sm:px-8 lg:px-12 relative overflow-hidden font-sans">
      <div className="max-w-4xl mx-auto space-y-12 animate-pulse">
        <div className="h-4 w-32 bg-white/[0.04] border border-white/[0.08] rounded" />

        <div className="space-y-6">
          <div className="flex gap-3">
            <div className="h-5 w-24 bg-white/[0.03] border border-white/[0.07] rounded" />
            <div className="h-5 w-32 bg-white/[0.03] border border-white/[0.07] rounded" />
          </div>

          <div className="h-10 sm:h-14 w-11/12 bg-white/[0.06] border border-white/[0.08] rounded-xl" />

          <div className="flex items-center gap-3 pt-2">
            <div className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/[0.08]" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-28 bg-white/[0.06] rounded" />
              <div className="h-3 w-36 bg-white/[0.03] rounded" />
            </div>
          </div>
        </div>

        <div className="h-64 sm:h-80 w-full bg-[#0D0D0D] border border-white/[0.08] rounded-xl" />

        <div className="bg-[#0D0D0D] border border-white/[0.08] rounded-xl p-6 sm:p-10 space-y-4">
          <div className="h-3.5 w-full bg-white/[0.03] rounded" />
          <div className="h-3.5 w-11/12 bg-white/[0.03] rounded" />
          <div className="h-3.5 w-5/6 bg-white/[0.03] rounded" />
          <div className="h-3.5 w-full bg-white/[0.03] rounded" />
          <div className="h-3.5 w-4/5 bg-white/[0.03] rounded" />
        </div>
      </div>
    </div>
  );
}
