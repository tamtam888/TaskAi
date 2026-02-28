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
  Trash2, Pencil, Check, X,
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
import { getTodayString, isPastDate } from "@/lib/date-utils";
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

// ─── Columns that are condensed on tablet (hidden below lg) ──────────────────
const TABLET_HIDDEN_COLS = new Set(["created_at"]);

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
                className="h-7 w-7 flex-shrink-0 text-slate-300 hover:text-violet-500 hover:bg-violet-50 rounded-lg"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
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
          {/* Project select */}
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
                "[&>span]:truncate [&>svg]:absolute [&>svg]:left-2 [&>svg]:top-1/2 [&>svg]:-translate-y-1/2"
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

          {/* Due date */}
          <input
            type="date"
            dir="ltr"
            defaultValue={task.due_date || ""}
            min={getTodayString()}
            onChange={(e) => {
              const newDate = e.target.value;
              if (newDate && isPastDate(newDate)) return; // guard: reject past dates
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

      {/* Create-project dialog for mobile card */}
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
    data: tasks,
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

  return (
    <div className="space-y-4 sm:space-y-6">

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

      {/* ── Mobile cards (< sm = 640 px) ── */}
      <div className="sm:hidden space-y-3">
        {visibleRows.length === 0 ? (
          <div className="bg-white rounded-2xl border border-violet-100 p-10 text-center text-slate-400 shadow-sm">
            <Plus className="h-8 w-8 text-violet-200 mx-auto mb-2" />
            <p className="font-medium">אין משימות עדיין</p>
            <p className="text-xs mt-1">לחץ על &quot;משימה חדשה&quot; להתחיל</p>
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
        {/* Mobile pagination — always shown for orientation */}
        <div className="bg-white rounded-2xl border border-violet-100 shadow-sm overflow-hidden">
          <PaginationBar {...paginationProps} />
        </div>
      </div>

      {/* ── Table (≥ sm = 640 px): tablet condensed + desktop full ── */}
      <div className="hidden sm:block bg-white rounded-2xl border border-violet-100 shadow-sm overflow-hidden">
        {/* Horizontal scroll on tablet so table never breaks layout */}
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
                        // Hide low-priority columns on tablet (640-1023 px)
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
                      <p className="font-medium">אין משימות עדיין</p>
                      <p className="text-xs">לחץ על &quot;משימה חדשה&quot; להתחיל</p>
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
