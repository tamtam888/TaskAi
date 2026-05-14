import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-4 w-52" />
      </div>

      {/* Account card */}
      <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-lg" />
          <Skeleton className="h-5 w-28" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-5 w-44" />
        </div>
      </div>

      {/* Preferences card */}
      <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-lg" />
          <Skeleton className="h-5 w-24" />
        </div>
        {[1, 2].map((i) => (
          <div key={i} className="space-y-2.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-52" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
