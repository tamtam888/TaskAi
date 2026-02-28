"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { toast } from "sonner";
import {
  User,
  SlidersHorizontal,
  CheckSquare,
  LayoutDashboard,
  AlignJustify,
  AlignLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// ── localStorage keys (exported so other parts of the app can read them) ──
export const LS_DEFAULT_VIEW = "settings_default_view";
export const LS_UI_DENSITY = "settings_ui_density";

type DefaultView = "tasks" | "dashboard";
type UIDensity = "comfortable" | "compact";

interface SettingsClientProps {
  email: string;
  createdAt: string | null;
}

// ── Small option card used for both preference sections ────────────────────
function OptionCard({
  active,
  onClick,
  icon,
  label,
  description,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-right w-full transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-1",
        active
          ? "border-violet-500 bg-violet-50 shadow-sm"
          : "border-slate-100 bg-white hover:border-violet-200 hover:bg-violet-50/30"
      )}
    >
      <div
        className={cn(
          "h-8 w-8 rounded-lg flex items-center justify-center",
          active ? "bg-violet-100 text-violet-600" : "bg-slate-100 text-slate-500"
        )}
      >
        {icon}
      </div>
      <div>
        <p className={cn("text-sm font-semibold", active ? "text-violet-700" : "text-slate-700")}>
          {label}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
      {active && (
        <span className="self-end mt-auto text-[10px] font-bold text-violet-500 uppercase tracking-wide">
          פעיל
        </span>
      )}
    </button>
  );
}

// ── Main settings component ────────────────────────────────────────────────
export function SettingsClient({ email, createdAt }: SettingsClientProps) {
  // Defaults are rendered on both server + first client paint to avoid hydration mismatch.
  // useEffect then overwrites from localStorage.
  const [defaultView, setDefaultView] = useState<DefaultView>("tasks");
  const [density, setDensity] = useState<UIDensity>("comfortable");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedView = localStorage.getItem(LS_DEFAULT_VIEW) as DefaultView | null;
    const storedDensity = localStorage.getItem(LS_UI_DENSITY) as UIDensity | null;
    if (storedView === "tasks" || storedView === "dashboard") setDefaultView(storedView);
    if (storedDensity === "comfortable" || storedDensity === "compact") setDensity(storedDensity);
    setMounted(true);
  }, []);

  const saveDefaultView = (v: DefaultView) => {
    setDefaultView(v);
    localStorage.setItem(LS_DEFAULT_VIEW, v);
    toast.success("ההגדרה נשמרה");
  };

  const saveDensity = (d: UIDensity) => {
    setDensity(d);
    localStorage.setItem(LS_UI_DENSITY, d);
    toast.success("ההגדרה נשמרה");
  };

  const formattedDate = createdAt
    ? format(new Date(createdAt), "d בMMMM yyyy", { locale: he })
    : null;

  return (
    <div className="space-y-6 max-w-2xl">

      {/* ── Page header ── */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">הגדרות</h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">נהל את פרטי החשבון וההעדפות שלך</p>
      </div>

      {/* ── Account info card ── */}
      <Card className="border border-violet-100 shadow-sm bg-white rounded-2xl">
        <CardHeader className="pb-2 pt-5 px-6">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
            <div className="h-7 w-7 rounded-lg bg-violet-50 flex items-center justify-center">
              <User className="h-4 w-4 text-violet-500" />
            </div>
            פרטי חשבון
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6 space-y-5">

          {/* Email */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              כתובת אימייל
            </Label>
            <div className="flex items-center h-10 px-3 rounded-xl border border-violet-100 bg-violet-50/40 text-sm text-slate-700 select-all">
              {email}
            </div>
            <p className="text-xs text-slate-400">לא ניתן לשנות את כתובת האימייל</p>
          </div>

          {/* Created date */}
          {formattedDate && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                חשבון נוצר
              </Label>
              <p className="text-sm text-slate-700">{formattedDate}</p>
            </div>
          )}

        </CardContent>
      </Card>

      {/* ── Preferences card ── */}
      <Card className="border border-violet-100 shadow-sm bg-white rounded-2xl">
        <CardHeader className="pb-2 pt-5 px-6">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
            <div className="h-7 w-7 rounded-lg bg-violet-50 flex items-center justify-center">
              <SlidersHorizontal className="h-4 w-4 text-violet-500" />
            </div>
            העדפות
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6 space-y-7">

          {/* Default view */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">תצוגת ברירת מחדל</p>
            <p className="text-xs text-slate-400">הדף שנפתח אחרי כניסה לאפליקציה</p>
            {/* Suppress hydration mismatch while localStorage loads */}
            <div className={cn("grid grid-cols-2 gap-3", !mounted && "opacity-50 pointer-events-none")}>
              <OptionCard
                active={defaultView === "tasks"}
                onClick={() => saveDefaultView("tasks")}
                icon={<CheckSquare className="h-4 w-4" />}
                label="משימות"
                description="פתח את רשימת המשימות"
              />
              <OptionCard
                active={defaultView === "dashboard"}
                onClick={() => saveDefaultView("dashboard")}
                icon={<LayoutDashboard className="h-4 w-4" />}
                label="לוח מחוונים"
                description="פתח את תצוגת הסטטיסטיקות"
              />
            </div>
          </div>

          {/* UI density */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">צפיפות תצוגה</p>
            <p className="text-xs text-slate-400">משפיע על גודל ריווח הפריטים בממשק</p>
            <div className={cn("grid grid-cols-2 gap-3", !mounted && "opacity-50 pointer-events-none")}>
              <OptionCard
                active={density === "comfortable"}
                onClick={() => saveDensity("comfortable")}
                icon={<AlignJustify className="h-4 w-4" />}
                label="נוח"
                description="ריווח רגיל בין פריטים"
              />
              <OptionCard
                active={density === "compact"}
                onClick={() => saveDensity("compact")}
                icon={<AlignLeft className="h-4 w-4" />}
                label="קומפקטי"
                description="ריווח צמוד לצפייה בכמות גדולה"
              />
            </div>
          </div>

          <p className="text-xs text-slate-300">
            ההעדפות נשמרות במכשיר זה בלבד ואינן מסונכרנות בין מכשירים.
          </p>

        </CardContent>
      </Card>

    </div>
  );
}
