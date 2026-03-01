"use client";

import { useState, useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { toast } from "sonner";
import {
  Search, Plus, ChevronRight, ChevronLeft,
  Trash2, Pencil, Check, X, Sparkles, Zap,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AddTaskModal } from "./add-task-modal";
import { createTaskColumns } from "./columns";
import { CreateProjectDialog } from "./create-project-dialog";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { getTodayString, isPastDate, getDateInNDays } from "@/lib/date-utils";
import type { Project, TaskWithDetails } from "@/lib/types";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
} from "@/lib/types";

interface TasksClientProps {
  initialTasks: TaskWithDetails[];
  projects: Project[];
  tags?: unknown[];
}

// ─── Constants ────────────────────────────────────────────────────────────────
const TABLET_HIDDEN_COLS = new Set(["created_at"]);
const OVERLOAD_THRESHOLD = 7;
const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

type QuickFilter = "all" | "today" | "upcoming" | "overdue";

// ─── Smart default sort ───────────────────────────────────────────────────────
// Not-done before done → nearest due date first → null due dates last.
function smartSort(a: TaskWithDetails, b: TaskWithDetails): number {
  const doneA = a.status === "done" ? 1 : 0;
  const doneB = b.status === "done" ? 1 : 0;
  if (doneA !== doneB) return doneA - doneB;
  // Both done or both not-done: sort by due_date ascending (null = last)
  if (!a.due_date && !b.due_date) return 0;
  if (!a.due_date) return 1;
  if (!b.due_date) return -1;
  return a.due_date.localeCompare(b.due_date);
}

// ─── Focus task card ──────────────────────────────────────────────────────────
function FocusTaskCard({
  rank,
  task,
  onUpdate,
}: {
  rank: number;
  task: TaskWithDetails;
  onUpdate: (id: string, updates: Partial<TaskWithDetails>) => Promise<void>;
}) {
  const today = getTodayString();
  const isOverdue = task.due_date && isPastDate(task.due_date);
  const isDueToday = task.due_date === today;
  const isDone = task.status === "done";

  return (
    <div
      className={cn(
        "relative rounded-2xl border p-4 space-y-3 transition-all",
        isDone
          ? "bg-green-50 border-green-200 opacity-70"
          : "bg-white border-violet-200 shadow-sm"
      )}
    >
      {/* Rank badge */}
      <span className="absolute top-3 left-3 h-5 w-5 rounded-full bg-violet-100 text-violet-600 text-[10px] font-bold flex items-center justify-center">
        {rank}
      </span>

      {/* Title */}
      <p className={cn(
        "text-sm font-semibold pr-1 pl-7 leading-snug line-clamp-2",
        isDone ? "line-through text-slate-400" : "text-slate-800"
      )}>
        {task.title}
      </p>

      {/* Priority + due date */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={cn(
          "px-2 py-0.5 rounded-full text-xs font-medium",
          PRIORITY_COLORS[task.priority]
        )}>
          {PRIORITY_LABELS[task.priority]}
        </span>
        {task.due_date && (
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full font-medium",
            isOverdue
              ? "bg-red-100 text-red-700"
              : isDueToday
              ? "bg-amber-100 text-amber-700"
              : "bg-slate-100 text-slate-600"
          )}>
            {isOverdue ? "באיחור · " : isDueToday ? "היום · " : ""}
            {format(new Date(task.due_date + "T00:00:00"), "d MMM", { locale: he })}
          </span>
        )}
      </div>

      {/* Status selector */}
      <Select
        value={task.status}
        onValueChange={(v) =>
          onUpdate(task.id, { status: v as TaskWithDetails["status"] })
        }
      >
        <SelectTrigger className="h-7 text-xs border-0 bg-slate-50 hover:bg-violet-50 rounded-full px-3 shadow-none w-full">
          <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", STATUS_COLORS[task.status])}>
            {STATUS_LABELS[task.status]}
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="backlog">
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">רשימת המתנה</span>
          </SelectItem>
          <SelectItem value="in_progress">
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700">בביצוע</span>
          </SelectItem>
          <SelectItem value="done">
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">הושלם</span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

// ─── Mobile task card (< 640 px) ─────────────────────────────────────────────
function TaskMobileCard({
  task,
  projects,
  onUpdate,
  onDelete,
  onProjectCreated,
}: {
  task: TaskWithDetails;
  projects: Project[];
  onUpdate: (id: string, updates: Partial<TaskWithDetails>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onProjectCreated: (project: Project) => void;
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(task.title);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  const isOverdue =
    task.due_date &&
    isPastDate(task.due_date) &&
    task.status !== "done";

  const saveTitle = async () => {
    const trimmed = titleValue.trim();
    if (!trimmed) {
      setTitleValue(task.title);
      setEditingTitle(false);
      return;
    }
    if (trimmed !== task.title) {
      await onUpdate(task.id, { title: trimmed });
    }
    setEditingTitle(false);
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-4 space-y-3">

        {/* ── Title row ── */}
        <div className="flex items-start gap-2 min-h-[28px]">
          {editingTitle ? (
            <div className="flex items-center gap-1.5 flex-1">
              <Input
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveTitle();
                  if (e.key === "Escape") {
                    setTitleValue(task.title);
                    setEditingTitle(false);
                  }
                }}
                autoFocus
                className="h-8 text-sm flex-1 rounded-xl border-violet-200 focus-visible:ring-violet-400"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={saveTitle}
                className="h-7 w-7 flex-shrink-0 text-green-600 hover:bg-green-50 rounded-lg"
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { setTitleValue(task.title); setEditingTitle(false); }}
                className="h-7 w-7 flex-shrink-0 text-slate-400 hover:bg-slate-50 rounded-lg"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <>
              <p
                className="font-semibold text-slate-900 text-sm leading-snug flex-1 cursor-pointer hover:text-violet-700 transition-colors"
                onClick={() => setEditingTitle(true)}
                title="לחץ לעריכה"
              >
                {task.title}
              </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingTitle(true)}
                aria-label="ערוך כותרת"
                className="h-7 w-7 flex-shrink-0 text-slate-300 hover:text-violet-500 hover:bg-violet-50 rounded-lg"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="מחק משימה"
                    className="h-7 w-7 flex-shrink-0 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent dir="rtl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>מחיקת משימה</AlertDialogTitle>
                    <AlertDialogDescription>
                      האם אתה בטוח שברצונך למחוק את המשימה &quot;{task.title}&quot;?
                      פעולה זו אינה הפיכה.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>ביטול</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(task.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      מחק
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>

        {/* ── Status + Priority ── */}
        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={task.status}
            onValueChange={(v) =>
              onUpdate(task.id, { status: v as TaskWithDetails["status"] })
            }
          >
            <SelectTrigger className="h-7 text-xs w-auto min-w-[110px] border-0 bg-slate-50 hover:bg-violet-50 rounded-full px-2 shadow-none">
              <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", STATUS_COLORS[task.status])}>
                {STATUS_LABELS[task.status]}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="backlog">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">רשימת המתנה</span>
              </SelectItem>
              <SelectItem value="in_progress">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700">בביצוע</span>
              </SelectItem>
              <SelectItem value="done">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">הושלם</span>
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={task.priority}
            onValueChange={(v) =>
              onUpdate(task.id, { priority: v as TaskWithDetails["priority"] })
            }
          >
            <SelectTrigger className="h-7 text-xs w-auto min-w-[90px] border-0 bg-slate-50 hover:bg-violet-50 rounded-full px-2 shadow-none">
              <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", PRIORITY_COLORS[task.priority])}>
                {PRIORITY_LABELS[task.priority]}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">נמוכה</span>
              </SelectItem>
              <SelectItem value="medium">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">בינונית</span>
              </SelectItem>
              <SelectItem value="high">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">גבוהה</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ── Project + Due date ── */}
        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={task.project_id || "none"}
            onValueChange={(v) => {
              if (v === "new_project") {
                setCreateProjectOpen(true);
              } else {
                onUpdate(task.id, { project_id: v === "none" ? null : v });
              }
            }}
          >
            <SelectTrigger
              className={cn(
                "relative h-7 min-w-[110px] max-w-[170px] rounded-full border border-violet-200 bg-violet-50",
                "text-xs text-violet-700 font-medium shadow-none justify-center",
                "hover:bg-violet-100",
                "[&>svg]:absolute [&>svg]:left-2 [&>svg]:top-1/2 [&>svg]:-translate-y-1/2",
                "px-6"
              )}
            >
              <SelectValue placeholder="ללא פרויקט" />
            </SelectTrigger>
            <SelectContent align="center">
              <SelectItem value="none" className="justify-center text-center px-3 data-[state=checked]:bg-violet-100">
                ללא פרויקט
              </SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id} className="justify-center text-center px-3 data-[state=checked]:bg-violet-100">
                  {p.name}
                </SelectItem>
              ))}
              <SelectItem value="new_project" className="justify-center text-center px-3 text-violet-600 font-medium border-t mt-1 pt-2">
                + צור פרויקט חדש
              </SelectItem>
            </SelectContent>
          </Select>

          <input
            type="date"
            dir="ltr"
            defaultValue={task.due_date || ""}
            min={getTodayString()}
            onChange={(e) => {
              const newDate = e.target.value;
              if (newDate && isPastDate(newDate)) return;
              onUpdate(task.id, { due_date: newDate || null });
            }}
            className={cn(
              "h-7 text-xs border rounded-full px-3 bg-transparent",
              "focus:outline-none focus:ring-1 focus:ring-violet-400",
              isOverdue
                ? "text-red-600 border-red-300"
                : "text-slate-500 border-violet-200"
            )}
          />
        </div>
      </div>

      <CreateProjectDialog
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
        onProjectCreated={(project) => {
          onProjectCreated(project);
          onUpdate(task.id, { project_id: project.id });
        }}
      />
    </>
  );
}

// ─── Pagination bar (shared) ──────────────────────────────────────────────────
function PaginationBar({
  pageIndex,
  pageCount,
  canPrev,
  canNext,
  onPrev,
  onNext,
}: {
  pageIndex: number;
  pageCount: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-violet-50 bg-violet-50/30">
      <p className="text-sm text-slate-500">
        עמוד {pageIndex + 1} מתוך {pageCount}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={!canPrev}
          className="rounded-xl border-violet-200 hover:bg-violet-50"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!canNext}
          className="rounded-xl border-violet-200 hover:bg-violet-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function TasksClient({
  initialTasks,
  projects: initialProjects,
}: TasksClientProps) {
  const [tasks, setTasks] = useState<TaskWithDetails[]>(initialTasks);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [focusMode, setFocusMode] = useState(false);

  const handleProjectCreated = useCallback((project: Project) => {
    setProjects((prev) => [...prev, project]);
  }, []);

  const handleDeleteTask = useCallback(async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      toast.error("שגיאה במחיקת המשימה");
      return;
    }
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast.success("המשימה נמחקה");
  }, []);

  const handleUpdateTask = useCallback(
    async (id: string, updates: Partial<TaskWithDetails>) => {
      if (updates.due_date && isPastDate(updates.due_date)) {
        toast.error("לא ניתן לקבוע תאריך יעד בעבר");
        return;
      }

      const supabase = createClient();

      const dbUpdates: Record<string, unknown> = { ...updates };
      delete dbUpdates.project;
      delete dbUpdates.tags;

      if ("status" in updates) {
        if (updates.status === "done") {
          dbUpdates.completed_at = new Date().toISOString();
        } else {
          dbUpdates.completed_at = null;
        }
      }

      const { error } = await supabase
        .from("tasks")
        .update(dbUpdates)
        .eq("id", id);

      if (error) {
        toast.error("שגיאה בעדכון המשימה");
        return;
      }

      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                ...updates,
                project:
                  "project_id" in updates
                    ? projects.find((p) => p.id === updates.project_id) || null
                    : t.project,
              }
            : t
        )
      );
    },
    [projects]
  );

  // ── Smart-filtered + default-sorted data for the table ──────────────────────
  const displayTasks = useMemo(() => {
    const today = getTodayString();
    const in7Days = getDateInNDays(7);

    let filtered: TaskWithDetails[];
    if (quickFilter === "today") {
      filtered = tasks.filter(
        (t) => t.due_date === today && t.status !== "done"
      );
    } else if (quickFilter === "upcoming") {
      // next 7 days inclusive of today, not-done only
      filtered = tasks.filter(
        (t) =>
          t.due_date &&
          t.due_date >= today &&
          t.due_date <= in7Days &&
          t.status !== "done"
      );
    } else if (quickFilter === "overdue") {
      // past due date, not yet done
      filtered = tasks.filter(
        (t) => t.due_date && t.due_date < today && t.status !== "done"
      );
    } else {
      filtered = tasks;
    }

    // Apply smart default sort only when user hasn't manually sorted a column.
    // When sorting.length > 0 TanStack Table's getSortedRowModel takes over.
    if (sorting.length === 0) {
      return [...filtered].sort(smartSort);
    }
    return filtered;
  }, [tasks, quickFilter, sorting]);

  // ── Focus mode: top 3 not-done tasks by priority → nearest due date ─────────
  const focusTasks = useMemo(() => {
    return [...tasks]
      .filter((t) => t.status !== "done")
      .sort((a, b) => {
        const pa = PRIORITY_ORDER[a.priority] ?? 99;
        const pb = PRIORITY_ORDER[b.priority] ?? 99;
        if (pa !== pb) return pa - pb;
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return a.due_date.localeCompare(b.due_date);
      })
      .slice(0, 3);
  }, [tasks]);

  // ── Overload hint: how many undone tasks are due today ──────────────────────
  const todayTaskCount = useMemo(() => {
    const today = getTodayString();
    return tasks.filter((t) => t.due_date === today && t.status !== "done").length;
  }, [tasks]);

  const columns = useMemo(
    () =>
      createTaskColumns({
        projects,
        onDelete: handleDeleteTask,
        onUpdate: handleUpdateTask,
        onProjectCreated: handleProjectCreated,
      }),
    [projects, handleDeleteTask, handleUpdateTask, handleProjectCreated]
  );

  const table = useReactTable({
    data: displayTasks,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
    globalFilterFn: "includesString",
  });

  const visibleRows = table.getRowModel().rows;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount() || 1;

  const paginationProps = {
    pageIndex,
    pageCount,
    canPrev: table.getCanPreviousPage(),
    canNext: table.getCanNextPage(),
    onPrev: () => table.previousPage(),
    onNext: () => table.nextPage(),
  };

  const handleQuickFilter = (f: QuickFilter) => {
    setQuickFilter(f);
    table.setPageIndex(0);
  };

  const QUICK_FILTER_LABELS: Record<QuickFilter, string> = {
    all: "הכל",
    today: "היום",
    upcoming: "שבוע קרוב",
    overdue: "באיחור",
  };

  return (
    <div className="space-y-4 sm:space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            המשימות שלי
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            {tasks.length} משימות סה&quot;כ
          </p>
        </div>
        <AddTaskModal
          projects={projects}
          onTaskAdded={(task) => setTasks((prev) => [task, ...prev])}
          onProjectCreated={handleProjectCreated}
        />
      </div>

      {/* ── Overload hint ── */}
      {todayTaskCount > OVERLOAD_THRESHOLD && !focusMode && (
        <div className="flex items-center justify-between gap-3 bg-violet-50 border border-violet-200 rounded-2xl px-4 py-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Zap className="h-4 w-4 text-violet-500 flex-shrink-0" />
            <p className="text-sm text-violet-800">
              נראה שיש הרבה משימות להיום. אולי כדאי לבחור 3 למשימות מרכזיות?
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setFocusMode(true)}
            className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs flex-shrink-0"
          >
            <Sparkles className="h-3.5 w-3.5 ml-1" />
            הפעל מצב פוקוס
          </Button>
        </div>
      )}

      {/* ── Search bar ── */}
      <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-3">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-violet-400" />
          <Input
            placeholder="חיפוש משימות..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pr-9 rounded-xl border-violet-100 focus-visible:ring-violet-400 bg-violet-50/40 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* ── Filter chips + Focus mode button ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Quick filter pills */}
        <div className="flex items-center gap-2">
          {(["all", "today", "upcoming", "overdue"] as QuickFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => handleQuickFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-1",
                quickFilter === f
                  ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                  : "bg-white text-slate-600 border-violet-100 hover:border-violet-300 hover:bg-violet-50"
              )}
            >
              {QUICK_FILTER_LABELS[f]}
            </button>
          ))}
        </div>

        {/* Focus mode toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFocusMode((f) => !f)}
          className={cn(
            "gap-1.5 rounded-full text-xs font-medium border transition-all",
            focusMode
              ? "bg-violet-600 text-white border-violet-600 hover:bg-violet-700 hover:text-white"
              : "border-violet-200 text-violet-700 hover:bg-violet-50"
          )}
        >
          <Sparkles className="h-3.5 w-3.5" />
          מצב פוקוס
        </Button>
      </div>

      {/* ── Focus mode panel ── */}
      {focusMode && (
        <div className="bg-gradient-to-br from-violet-50 to-white rounded-2xl border border-violet-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-500" />
              <h2 className="text-sm font-semibold text-slate-800">
                3 המשימות הדחופות ביותר
              </h2>
            </div>
            <button
              onClick={() => setFocusMode(false)}
              aria-label="צא ממצב פוקוס"
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 rounded"
            >
              <X className="h-3.5 w-3.5" />
              צא ממצב פוקוס
            </button>
          </div>

          {focusTasks.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-2xl mb-2">🎉</p>
              <p className="text-sm font-medium text-slate-700">כל המשימות הושלמו!</p>
              <p className="text-xs text-slate-400 mt-0.5">אין משימות פתוחות כרגע</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              {focusTasks.map((task, i) => (
                <FocusTaskCard
                  key={task.id}
                  rank={i + 1}
                  task={task}
                  onUpdate={handleUpdateTask}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Mobile cards (< sm = 640 px) ── */}
      <div className="sm:hidden space-y-3">
        {visibleRows.length === 0 ? (
          <div className="bg-white rounded-2xl border border-violet-100 p-10 text-center text-slate-400 shadow-sm">
            <Plus className="h-8 w-8 text-violet-200 mx-auto mb-2" />
            <p className="font-medium">אין משימות להצגה</p>
            <p className="text-xs mt-1">
              {quickFilter !== "all"
                ? "נסה לשנות את הסינון"
                : 'לחץ על "משימה חדשה" להתחיל'}
            </p>
          </div>
        ) : (
          visibleRows.map((row) => (
            <TaskMobileCard
              key={row.id}
              task={row.original}
              projects={projects}
              onUpdate={handleUpdateTask}
              onDelete={handleDeleteTask}
              onProjectCreated={handleProjectCreated}
            />
          ))
        )}
        <div className="bg-white rounded-2xl border border-violet-100 shadow-sm overflow-hidden">
          <PaginationBar {...paginationProps} />
        </div>
      </div>

      {/* ── Table (≥ sm = 640 px) ── */}
      <div className="hidden sm:block bg-white rounded-2xl border border-violet-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="bg-violet-50/60 border-b border-violet-100"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className={cn(
                        "font-semibold text-slate-600 whitespace-nowrap",
                        TABLET_HIDDEN_COLS.has(header.column.id) && "hidden lg:table-cell"
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {visibleRows.length ? (
                visibleRows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-violet-50/40 transition-colors border-b border-slate-50 last:border-0"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          TABLET_HIDDEN_COLS.has(cell.column.id) && "hidden lg:table-cell"
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-36 text-center text-slate-400"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Plus className="h-8 w-8 text-violet-200" />
                      <p className="font-medium">אין משימות להצגה</p>
                      <p className="text-xs">
                        {quickFilter !== "all"
                          ? "נסה לשנות את הסינון"
                          : 'לחץ על "משימה חדשה" להתחיל'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <PaginationBar {...paginationProps} />
      </div>

    </div>
  );
}
