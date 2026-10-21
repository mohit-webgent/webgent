import { Skeleton } from "@/components/ui/skeleton";

export function ContactPageSkeleton() {
  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
      {/* LEFT SIDE: Agency Contact Card (5 Cols) */}
      <div className="lg:col-span-5 bg-[#0F1014] border border-white/[0.08] rounded-[24px] p-7 sm:p-9 md:p-10 shadow-2xl text-left space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-10 sm:h-12 w-4/5 rounded-xl bg-white/[0.08]" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-full bg-white/[0.03]" />
            <Skeleton className="h-4 w-4/5 bg-white/[0.03]" />
          </div>
        </div>

        {/* Contact Info Badges (Email, Phone, Location) */}
        <div className="space-y-6 pt-4 border-t border-white/[0.06]">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-xl bg-[#1A1C24] border border-white/[0.08] shrink-0" />
              <div className="space-y-1.5 min-w-0 w-full">
                <Skeleton className="h-3 w-16 bg-white/[0.03]" />
                <Skeleton className="h-4 w-44 bg-white/[0.05]" />
              </div>
            </div>
          ))}
        </div>

        {/* WhatsApp Card */}
        <div className="p-5 rounded-2xl bg-[#14161F] border border-white/[0.06] space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded-full bg-white/[0.06]" />
            <Skeleton className="h-4 w-36 rounded bg-white/[0.06]" />
          </div>
          <Skeleton className="h-3 w-4/5 bg-white/[0.03]" />
        </div>
      </div>

      {/* RIGHT SIDE: Contact Form Card (7 Cols) */}
      <div className="lg:col-span-7 bg-[#0F1014] border border-white/[0.08] rounded-[24px] p-7 sm:p-9 md:p-10 shadow-2xl text-left space-y-7">
        {/* Name & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-20 bg-white/[0.04]" />
            <Skeleton className="h-11 w-full rounded-xl bg-[#14161F] border border-white/[0.08]" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-24 bg-white/[0.04]" />
            <Skeleton className="h-11 w-full rounded-xl bg-[#14161F] border border-white/[0.08]" />
          </div>
        </div>

        {/* Phone & Company */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-24 bg-white/[0.04]" />
            <Skeleton className="h-11 w-full rounded-xl bg-[#14161F] border border-white/[0.08]" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-20 bg-white/[0.04]" />
            <Skeleton className="h-11 w-full rounded-xl bg-[#14161F] border border-white/[0.08]" />
          </div>
        </div>

        {/* Service Scope Chips */}
        <div className="space-y-2.5">
          <Skeleton className="h-3.5 w-32 bg-white/[0.04]" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <Skeleton key={s} className="h-9 rounded-lg bg-[#14161F] border border-white/[0.06]" />
            ))}
          </div>
        </div>

        {/* Budget Chips */}
        <div className="space-y-2.5">
          <Skeleton className="h-3.5 w-36 bg-white/[0.04]" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((b) => (
              <Skeleton key={b} className="h-8 rounded-lg bg-[#14161F] border border-white/[0.06]" />
            ))}
          </div>
        </div>

        {/* Message Textarea */}
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-28 bg-white/[0.04]" />
          <Skeleton className="h-28 w-full rounded-xl bg-[#14161F] border border-white/[0.08]" />
        </div>

        {/* Submit Button */}
        <Skeleton className="h-12 w-full rounded-xl bg-white/[0.12]" />
      </div>
    </div>
  );
}

export default function ContactLoading() {
  return (
    <div className="min-h-[85vh] w-full bg-[#000000] text-white pt-8 pb-16 sm:pt-14 sm:pb-24 px-4 sm:px-8 lg:px-12 relative overflow-hidden font-sans">
      <div className="w-full max-w-6xl mx-auto relative z-10">
        <ContactPageSkeleton />
      </div>
    </div>
  );
}
