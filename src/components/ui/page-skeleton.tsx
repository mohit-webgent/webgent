/** Loading placeholder shaped like an inner page, so content doesn't jump when it arrives. */
export function PageSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <div role="status" aria-label="Loading" className="wrap animate-pulse pb-24 pt-16 sm:pt-24">
      <div className="h-3 w-28 rounded-full bg-white/10" />
      <div className="mt-7 h-14 w-full max-w-3xl rounded-2xl bg-white/[0.07] sm:h-20" />
      <div className="mt-4 h-14 w-2/3 max-w-xl rounded-2xl bg-white/[0.07] sm:h-20" />
      <div className="mt-7 h-4 w-full max-w-xl rounded-full bg-white/[0.06]" />
      <div className="mt-3 h-4 w-3/4 max-w-md rounded-full bg-white/[0.06]" />
      <div className="mt-16 grid gap-5 md:grid-cols-2">
        {Array.from({ length: cards }).map((_, index) => (
          <div key={index} className="aspect-[16/10] rounded-[1.25rem] border border-line bg-surface" />
        ))}
      </div>
    </div>
  );
}
