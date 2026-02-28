import { Skeleton } from "@/components/ui/skeleton";

const ROW_NAME_WIDTHS = [180, 220, 155, 200, 145];

export default function ProjectsLoading() {
  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="h-10 w-32 rounded-2xl" />
      </div>

      {/* Project rows */}
      <div className="flex flex-col gap-3">
        {ROW_NAME_WIDTHS.map((w, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-5 py-4 bg-white rounded-2xl border border-violet-100 shadow-sm"
          >
            <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
            <Skeleton className="h-5 flex-1 max-w-[var(--w)]" style={{ maxWidth: w }} />
            <Skeleton className="h-6 w-20 rounded-full ml-auto" />
          </div>
        ))}
      </div>

    </div>
  );
}
