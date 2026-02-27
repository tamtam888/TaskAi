"use client";

import { useMemo } from "react";
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
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  FolderOpen,
} from "lucide-react";
import type { Task } from "@/lib/types";
import { PRIORITY_LABELS } from "@/lib/types";

interface DashboardClientProps {
  tasks: Task[];
}

const PRIORITY_CHART_COLORS: Record<string, string> = {
  low: "#94a3b8",
  medium: "#f59e0b",
  high: "#ef4444",
};

const STATUS_CHART_COLORS: Record<string, string> = {
  backlog: "#94a3b8",
  in_progress: "#8b5cf6",
  done: "#22c55e",
};

export function DashboardClient({ tasks }: DashboardClientProps) {
  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "done").length;
    const completionPct = total > 0 ? Math.round((done / total) * 100) : 0;

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const overdue = tasks.filter(
      (t) =>
        t.due_date &&
        new Date(t.due_date) < now &&
        t.status !== "done"
    ).length;

    // Priority breakdown
    const priorityMap: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
    };
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
    tasks.forEach((t: Task & { project?: { id: string; name: string } | null }) => {
      const projectName = t.project?.name || "ללא פרויקט";
      const key = t.project_id || "none";
      if (!projectMap[key]) {
        projectMap[key] = { name: projectName, count: 0 };
      }
      projectMap[key].count++;
    });
    const projectData = Object.values(projectMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return { total, done, completionPct, overdue, priorityData, projectData };
  }, [tasks]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">לוח מחוונים</h1>
        <p className="text-slate-500 text-sm mt-1">סקירה כללית של המשימות שלך</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Completion % */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                אחוז השלמה
              </CardTitle>
              <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-slate-900">
              {stats.completionPct}%
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {stats.done} מתוך {stats.total} משימות הושלמו
            </p>
            {/* Progress bar */}
            <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${stats.completionPct}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Overdue */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                משימות באיחור
              </CardTitle>
              <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`text-4xl font-bold ${
                stats.overdue > 0 ? "text-red-600" : "text-slate-900"
              }`}
            >
              {stats.overdue}
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {stats.overdue === 0
                ? "אין משימות באיחור"
                : "משימות שעברו את תאריך היעד"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Pie Chart */}
        <Card className="border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-slate-500" />
              <CardTitle className="text-base font-semibold text-slate-800">
                משימות לפי עדיפות
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {stats.priorityData.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-slate-400">
                אין נתונים
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stats.priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {stats.priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [value, name]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Project Bar Chart */}
        <Card className="border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-slate-500" />
              <CardTitle className="text-base font-semibold text-slate-800">
                משימות לפי פרויקט
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {stats.projectData.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-slate-400">
                אין נתונים
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={stats.projectData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="משימות" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
