"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  AlertTriangle,
  ListTodo,
  Loader,
  TrendingUp,
  FolderOpen,
} from "lucide-react";
import type { Task } from "@/lib/types";
import { PRIORITY_LABELS } from "@/lib/types";
import { isPastDate } from "@/lib/date-utils";

interface DashboardClientProps {
  tasks: Task[];
}

const PRIORITY_CHART_COLORS: Record<string, string> = {
  low: "#94a3b8",
  medium: "#f59e0b",
  high: "#ef4444",
};

export function DashboardClient({ tasks }: DashboardClientProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const axisTickColorLight = "#94a3b8";
  const axisTickColorDark = "hsl(220,10%,60%)";
  const axisTickColor = isDark ? axisTickColorDark : axisTickColorLight;

  const gridStroke = isDark ? "hsl(225,15%,24%)" : "#f1f0ff";

  const tooltipStyle = isDark
    ? {
        borderRadius: "0.75rem",
        border: "1px solid hsl(225,15%,24%)",
        fontSize: "13px",
        backgroundColor: "hsl(225,15%,18%)",
        color: "hsl(220,14%,92%)",
      }
    : {
        borderRadius: "0.75rem",
        border: "1px solid #ede9fe",
        fontSize: "13px",
      };

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "done").length;
    const inProgress = tasks.filter((t) => t.status === "in_progress").length;
    const completionPct = total > 0 ? Math.round((done / total) * 100) : 0;

    const overdue = tasks.filter(
      (t) => t.due_date && isPastDate(t.due_date) && t.status !== "done"
    ).length;

    // Priority breakdown
    const priorityMap: Record<string, number> = { low: 0, medium: 0, high: 0 };
    tasks.forEach((t) => {
      priorityMap[t.priority] = (priorityMap[t.priority] || 0) + 1;
    });
    const priorityData = Object.entries(priorityMap)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => ({
        name: PRIORITY_LABELS[key as keyof typeof PRIORITY_LABELS],
        value,
        color: PRIORITY_CHART_COLORS[key],
      }));

    // Project breakdown
    const projectMap: Record<string, { name: string; count: number }> = {};
    tasks.forEach(
      (t: Task & { project?: { id: string; name: string } | null }) => {
        const projectName = t.project?.name || "ללא פרויקט";
        const key = t.project_id || "none";
        if (!projectMap[key]) projectMap[key] = { name: projectName, count: 0 };
        projectMap[key].count++;
      }
    );
    const projectData = Object.values(projectMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return {
      total,
      done,
      inProgress,
      completionPct,
      overdue,
      priorityData,
      projectData,
    };
  }, [tasks]);

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* ── Header ── */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
          לוח מחוונים
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
          סקירה כללית של המשימות שלך
        </p>
      </div>

      {/* ── Stat cards: 1 col → 2 col → 4 col ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

        {/* Completion % */}
        <Card className="border border-border shadow-sm bg-card">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                אחוז השלמה
              </CardTitle>
              <div className="h-9 w-9 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-3xl font-bold text-foreground">
              {stats.completionPct}%
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {stats.done} מתוך {stats.total} הושלמו
            </p>
            <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-700"
                style={{ width: `${stats.completionPct}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Overdue */}
        <Card className="border border-border shadow-sm bg-card">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                באיחור
              </CardTitle>
              <div className="h-9 w-9 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div
              className={`text-3xl font-bold ${
                stats.overdue > 0 ? "text-destructive" : "text-foreground"
              }`}
            >
              {stats.overdue}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {stats.overdue === 0 ? "הכל בזמן" : "עברו את תאריך היעד"}
            </p>
          </CardContent>
        </Card>

        {/* Total Tasks */}
        <Card className="border border-border shadow-sm bg-card">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                סה&quot;כ משימות
              </CardTitle>
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <ListTodo className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-3xl font-bold text-foreground">
              {stats.total}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">כלל המשימות</p>
          </CardContent>
        </Card>

        {/* In Progress */}
        <Card className="border border-border shadow-sm bg-card">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                בביצוע
              </CardTitle>
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Loader className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-3xl font-bold text-foreground">
              {stats.inProgress}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">משימות פעילות</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Charts: 1 col → 2 col ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        {/* Priority Pie Chart */}
        <Card className="border border-border shadow-sm bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-sm sm:text-base font-semibold text-foreground">
                משימות לפי עדיפות
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {stats.priorityData.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                אין נתונים להצגה
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={stats.priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={88}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {stats.priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [value, name]} />
                  <Legend
                    iconType="circle"
                    iconSize={10}
                    wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Project Bar Chart */}
        <Card className="border border-border shadow-sm bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FolderOpen className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-sm sm:text-base font-semibold text-foreground">
                משימות לפי פרויקט
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {stats.projectData.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                אין נתונים להצגה
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={stats.projectData}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke={gridStroke}
                  />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: axisTickColor }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={75}
                    tick={{ fontSize: 11, fill: axisTickColor }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: string) =>
                      v.length > 10 ? v.slice(0, 10) + "…" : v
                    }
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar
                    dataKey="count"
                    fill="#8b5cf6"
                    radius={[0, 6, 6, 0]}
                    name="משימות"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
