import React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Base accessible Skeleton component.
 * Uses motion-safe pulse animation, dark aesthetic tokens, and aria-hidden for decorative loading states.
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "bg-white/[0.05] border border-white/[0.04] motion-safe:animate-pulse rounded-lg pointer-events-none select-none",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Renders an accessible table body skeleton with exact column widths and row counts.
 */
export interface TableSkeletonProps {
  columns: Array<{
    width?: string;
    className?: string;
  }>;
  rows?: number;
  rowHeight?: string;
}

export function TableSkeletonRows({
  columns,
  rows = 5,
  rowHeight = "h-14",
}: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx} className={cn("border-b border-slate-800/60", rowHeight)}>
          {columns.map((col, cIdx) => (
            <td key={cIdx} className={cn("py-3.5 px-4", col.width, col.className)}>
              <Skeleton className="h-4 w-3/4 rounded" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/**
 * Renders a standardized Page Header skeleton with badge, title, and description.
 */
export interface PageHeaderSkeletonProps {
  align?: "left" | "center";
  hasBadge?: boolean;
  maxWidth?: string;
}

export function PageHeaderSkeleton({
  align = "left",
  hasBadge = true,
  maxWidth = "max-w-3xl",
}: PageHeaderSkeletonProps) {
  const isCenter = align === "center";
  return (
    <div
      className={cn(
        "space-y-3.5",
        maxWidth,
        isCenter ? "mx-auto text-center items-center" : "text-left",
      )}
    >
      {hasBadge && (
        <Skeleton
          className={cn(
            "h-6 w-36 rounded-full bg-white/[0.04]",
            isCenter ? "mx-auto" : "",
          )}
        />
      )}
      <Skeleton
        className={cn(
          "h-10 sm:h-12 w-4/5 rounded-xl bg-white/[0.07]",
          isCenter ? "mx-auto" : "",
        )}
      />
      <div className={cn("space-y-1.5 pt-1", isCenter ? "mx-auto" : "")}>
        <Skeleton
          className={cn("h-3.5 w-full bg-white/[0.03]", isCenter ? "mx-auto" : "")}
        />
        <Skeleton
          className={cn("h-3.5 w-3/5 bg-white/[0.03]", isCenter ? "mx-auto" : "")}
        />
      </div>
    </div>
  );
}

/**
 * Standardized KPI Stat Card skeleton matching admin & analytics cards.
 */
export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-24 bg-white/[0.05]" />
        <Skeleton className="w-9 h-9 rounded-xl bg-white/[0.06]" />
      </div>
      <div className="space-y-1.5 pt-1">
        <Skeleton className="h-8 w-20 rounded-md bg-white/[0.08]" />
        <Skeleton className="h-3 w-32 bg-white/[0.03]" />
      </div>
    </div>
  );
}
