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
import { toast } from "sonner";
import { Search, Plus, ChevronRight, ChevronLeft } from "lucide-react";
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
import { AddTaskModal } from "./add-task-modal";
import { createTaskColumns } from "./columns";
import { createClient } from "@/lib/supabase/client";
import type { Project, TaskWithDetails } from "@/lib/types";

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

interface TasksClientProps {
  initialTasks: TaskWithDetails[];
  projects: Project[];
  tags?: unknown[]; // kept for backward compat; tags UI removed
}

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
      // Validate due_date is not in the past
      if (updates.due_date && updates.due_date < getTodayString()) {
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
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
    globalFilterFn: "includesString",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">המשימות שלי</h1>
          <p className="text-slate-500 text-sm mt-1">
            {tasks.length} משימות סה&quot;כ
          </p>
        </div>
        <AddTaskModal
          projects={projects}
          onTaskAdded={(task) => setTasks((prev) => [task, ...prev])}
          onProjectCreated={handleProjectCreated}
        />
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border shadow-sm p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="חיפוש משימות..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pr-9"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-slate-50">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="font-semibold text-slate-700 whitespace-nowrap"
                    style={{ width: header.getSize() }}
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
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-purple-50/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  className="h-32 text-center text-slate-500"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Plus className="h-8 w-8 text-slate-300" />
                    <p>אין משימות עדיין</p>
                    <p className="text-xs">לחץ על &quot;משימה חדשה&quot; להתחיל</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50">
          <p className="text-sm text-slate-500">
            עמוד {table.getState().pagination.pageIndex + 1} מתוך{" "}
            {table.getPageCount() || 1}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
