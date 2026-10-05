export default function BlogPostDetailLoading() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="max-w-4xl mx-auto space-y-12 animate-pulse">
        <div className="h-4 w-32 bg-slate-900 border border-slate-800 rounded-lg" />

        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="h-6 w-24 bg-slate-900 border border-slate-800 rounded-full" />
            <div className="h-6 w-32 bg-slate-900 border border-slate-800 rounded-full" />
          </div>

          <div className="h-12 sm:h-16 w-11/12 bg-slate-800/80 rounded-2xl" />

          <div className="flex items-center gap-3 pt-2">
            <div className="w-10 h-10 rounded-full bg-slate-800" />
            <div className="space-y-2">
              <div className="h-4 w-28 bg-slate-800 rounded" />
              <div className="h-3 w-40 bg-slate-800/50 rounded" />
            </div>
          </div>
        </div>

        <div className="h-72 sm:h-96 w-full bg-slate-900 border border-slate-800 rounded-3xl" />

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-4">
          <div className="h-4 w-full bg-slate-800/70 rounded" />
          <div className="h-4 w-11/12 bg-slate-800/70 rounded" />
          <div className="h-4 w-5/6 bg-slate-800/70 rounded" />
          <div className="h-4 w-full bg-slate-800/70 rounded" />
          <div className="h-4 w-4/5 bg-slate-800/70 rounded" />
        </div>
      </div>
    </div>
  );
}
