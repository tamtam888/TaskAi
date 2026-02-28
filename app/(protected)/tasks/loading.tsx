import { Skeleton } from "@/components/ui/skeleton";

// Column widths mirror the real table so there is no layout shift.
const COL_WIDTHS = [180, 130, 110, 90, 120, 95, 32];

export default function TasksLoading() {
  return (
    <div className="space-y-4 sm:space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-10 w-32 rounded-2xl" />
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-3">
        <Skeleton className="h-9 w-full sm:w-72 rounded-xl" />
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2">
          {[52, 48, 72, 60].map((w, i) => (
            <Skeleton key={i} className="h-8 rounded-full" style={{ width: w }} />
          ))}
        </div>
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>

      {/* Mobile skeletons (< sm) */}
      <div className="sm:hidden space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-violet-100 p-4 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-7 w-28 rounded-full" />
              <Skeleton className="h-7 w-20 rounded-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-7 w-32 rounded-full" />
              <Skeleton className="h-7 w-28 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table skeleton (≥ sm) */}
      <div className="hidden sm:block bg-white rounded-2xl border border-violet-100 shadow-sm overflow-hidden">
        {/* Header row */}
        <div className="flex items-center gap-4 px-4 py-3 bg-violet-50/60 border-b border-violet-100">
          {COL_WIDTHS.map((w, i) => (
            <Skeleton key={i} className="h-4 rounded" style={{ width: w }} />
          ))}
        </div>
        {/* Data rows */}
        {[200, 160, 220, 180, 190, 170, 210, 185].map((titleW, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-[14px] border-b border-slate-50 last:border-0">
            <Skeleton className="h-4 rounded" style={{ width: titleW - 20 }} />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-4 w-24 rounded-lg" />
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-7 w-7 rounded-lg" />
          </div>
        ))}
        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-violet-50">
          <Skeleton className="h-4 w-28" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-xl" />
            <Skeleton className="h-8 w-8 rounded-xl" />
          </div>
        </div>
      </div>

    </div>
  );
}
