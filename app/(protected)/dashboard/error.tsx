"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Dashboard] fetch error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="h-14 w-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
        <AlertTriangle className="h-7 w-7 text-red-400" />
      </div>
      <h2 className="text-lg font-semibold text-slate-800 mb-1">שגיאה בטעינת הנתונים</h2>
      <p className="text-sm text-slate-400 mb-6 max-w-xs">
        לא הצלחנו לטעון את נתוני לוח המחוונים. בדוק את החיבור לאינטרנט ונסה שוב.
      </p>
      <Button
        onClick={reset}
        className="rounded-xl bg-violet-600 hover:bg-violet-700"
      >
        נסה שוב
      </Button>
    </div>
  );
}
