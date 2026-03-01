"use client";

import { useState } from "react";
import { type ColumnDef, type CellContext } from "@tanstack/react-table";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { ArrowUpDown, Trash2 } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { getTodayString, isPastDate } from "@/lib/date-utils";
import { CreateProjectDialog } from "./create-project-dialog";
import type { Project, TaskWithDetails } from "@/lib/types";
import {
  STATUS_LABELS,
  PRIORITY_LABELS,
  STATUS_COLORS,
  PRIORITY_COLORS,
} from "@/lib/types";

interface ColumnOptions {
  projects: Project[];
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, updates: Partial<TaskWithDetails>) => Promise<void>;
  onProjectCreated: (project: Project) => void;
}

// Editable title cell
function EditableTitleCell({
  info,
  onUpdate,
}: {
  info: CellContext<TaskWithDetails, unknown>;
  onUpdate: (id: string, updates: Partial<TaskWithDetails>) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(info.row.original.title);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setValue(info.row.original.title);
      setEditing(false);
      return;
    }
    if (trimmed === info.row.original.title) {
      setEditing(false);
      return;
    }
    setSaving(true);
    await onUpdate(info.row.original.id, { title: trimmed });
    setSaving(false);
    setEditing(false);
  };

  if (editing) {
    return (
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") {
            setValue(info.row.original.title);
            setEditing(false);
          }
        }}
        autoFocus
        disabled={saving}
        className="h-8 text-sm min-w-[150px]"
      />
    );
  }

  return (
    <span
      className="cursor-pointer hover:text-violet-600 font-medium text-slate-900 min-w-[150px] block"
      onClick={() => setEditing(true)}
      title="לחץ לעריכה"
    >
      {info.row.original.title}
    </span>
  );
}

// Project select cell with create-project option
function ProjectSelectCell({
  info,
  projects,
  onUpdate,
  onProjectCreated,
}: {
  info: CellContext<TaskWithDetails, unknown>;
  projects: Project[];
  onUpdate: (id: string, updates: Partial<TaskWithDetails>) => Promise<void>;
  onProjectCreated: (project: Project) => void;
}) {
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  return (
    <>
      <Select
        value={info.row.original.project_id || "none"}
        onValueChange={(v) => {
          if (v === "new_project") {
            setCreateProjectOpen(true);
          } else {
            onUpdate(info.row.original.id, {
              project_id: v === "none" ? null : v,
            });
          }
        }}
      >
        <SelectTrigger
          className={cn(
            "relative h-9 w-[150px] rounded-full border border-violet-200 bg-violet-50",
            "text-xs text-violet-700 font-medium shadow-none justify-center",
            "hover:bg-violet-100 hover:border-violet-300",
            "focus:ring-2 focus:ring-violet-300 focus:ring-offset-0",
            "[&>svg]:absolute [&>svg]:left-2 [&>svg]:top-1/2 [&>svg]:-translate-y-1/2",
            "px-6"
          )}
        >
          <SelectValue placeholder="ללא פרויקט" />
        </SelectTrigger>
        <SelectContent align="center">
          <SelectItem
            value="none"
            className="justify-center text-center px-3 data-[state=checked]:bg-violet-100 data-[state=checked]:text-violet-700"
          >
            ללא פרויקט
          </SelectItem>
          {projects.map((p) => (
            <SelectItem
              key={p.id}
              value={p.id}
              className="justify-center text-center px-3 data-[state=checked]:bg-violet-100 data-[state=checked]:text-violet-700"
            >
              {p.name}
            </SelectItem>
          ))}
          <SelectItem
            value="new_project"
            className="justify-center text-center px-3 text-violet-600 font-medium border-t mt-1 pt-2"
          >
            + צור פרויקט חדש
          </SelectItem>
        </SelectContent>
      </Select>

      <CreateProjectDialog
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
        onProjectCreated={(project) => {
          onProjectCreated(project);
          onUpdate(info.row.original.id, { project_id: project.id });
        }}
      />
    </>
  );
}

export function createTaskColumns({
  projects,
  onDelete,
  onUpdate,
  onProjectCreated,
}: ColumnOptions): ColumnDef<TaskWithDetails>[] {
  return [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 -mr-3"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          כותרת
          <ArrowUpDown className="h-3.5 w-3.5" />
        </Button>
      ),
      cell: (info) => (
        <EditableTitleCell info={info} onUpdate={onUpdate} />
      ),
      size: 200,
    },
    {
      accessorKey: "project_id",
      header: "פרויקט",
      cell: (info) => (
        <ProjectSelectCell
          info={info}
          projects={projects}
          onUpdate={onUpdate}
          onProjectCreated={onProjectCreated}
        />
      ),
      filterFn: (row, _colId, filterValue) =>
        filterValue === "all" || row.original.project_id === filterValue,
      size: 140,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 -mr-3"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          סטטוס
          <ArrowUpDown className="h-3.5 w-3.5" />
        </Button>
      ),
      cell: (info) => (
        <Select
          value={info.row.original.status}
          onValueChange={(v) =>
            onUpdate(info.row.original.id, { status: v as TaskWithDetails["status"] })
          }
        >
          <SelectTrigger
            className={cn(
              "relative h-8 w-[120px] text-xs border-0 bg-transparent shadow-none",
              "justify-center hover:bg-violet-50",
              "[&>svg]:absolute [&>svg]:left-1.5 [&>svg]:top-1/2 [&>svg]:-translate-y-1/2"
            )}
          >
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium",
                STATUS_COLORS[info.row.original.status]
              )}
            >
              {STATUS_LABELS[info.row.original.status]}
            </span>
          </SelectTrigger>
          <SelectContent align="center">
            <SelectItem value="backlog" className="justify-center text-center px-3">
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                רשימת המתנה
              </span>
            </SelectItem>
            <SelectItem value="in_progress" className="justify-center text-center px-3">
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
                בביצוע
              </span>
            </SelectItem>
            <SelectItem value="done" className="justify-center text-center px-3">
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                הושלם
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      ),
      size: 130,
    },
    {
      accessorKey: "priority",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 -mr-3"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          עדיפות
          <ArrowUpDown className="h-3.5 w-3.5" />
        </Button>
      ),
      cell: (info) => (
        <Select
          value={info.row.original.priority}
          onValueChange={(v) =>
            onUpdate(info.row.original.id, {
              priority: v as TaskWithDetails["priority"],
            })
          }
        >
          <SelectTrigger
            className={cn(
              "relative h-8 w-[100px] text-xs border-0 bg-transparent shadow-none",
              "justify-center hover:bg-violet-50",
              "[&>svg]:absolute [&>svg]:left-1.5 [&>svg]:top-1/2 [&>svg]:-translate-y-1/2"
            )}
          >
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium",
                PRIORITY_COLORS[info.row.original.priority]
              )}
            >
              {PRIORITY_LABELS[info.row.original.priority]}
            </span>
          </SelectTrigger>
          <SelectContent align="center">
            <SelectItem value="low" className="justify-center text-center px-3">
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                נמוכה
              </span>
            </SelectItem>
            <SelectItem value="medium" className="justify-center text-center px-3">
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                בינונית
              </span>
            </SelectItem>
            <SelectItem value="high" className="justify-center text-center px-3">
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                גבוהה
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      ),
      size: 110,
    },
    {
      accessorKey: "due_date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 -mr-3"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          תאריך יעד
          <ArrowUpDown className="h-3.5 w-3.5" />
        </Button>
      ),
      cell: (info) => {
        const value = info.row.original.due_date;
        const isOverdue =
          value &&
          isPastDate(value) &&
          info.row.original.status !== "done";
        return (
          <input
            type="date"
            dir="ltr"
            defaultValue={value || ""}
            min={getTodayString()}
            onChange={(e) => {
              const newDate = e.target.value;
              if (newDate && isPastDate(newDate)) return; // guard: reject past dates
              onUpdate(info.row.original.id, {
                due_date: newDate || null,
              });
            }}
            className={cn(
              "text-xs border rounded-lg px-2 py-1 bg-transparent focus:outline-none focus:ring-1 focus:ring-violet-400 w-[130px]",
              isOverdue ? "text-red-600 border-red-300" : "text-slate-600"
            )}
          />
        );
      },
      size: 140,
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 -mr-3"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          נוצר ב
          <ArrowUpDown className="h-3.5 w-3.5" />
        </Button>
      ),
      cell: (info) => {
        const date = info.row.original.created_at;
        return (
          <span className="text-xs text-slate-500 whitespace-nowrap">
            {date
              ? format(new Date(date), "dd/MM/yyyy", { locale: he })
              : "—"}
          </span>
        );
      },
      size: 110,
    },
    {
      id: "actions",
      header: "פעולות",
      cell: (info) => (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="מחק משימה"
              className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle>מחיקת משימה</AlertDialogTitle>
              <AlertDialogDescription>
                האם אתה בטוח שברצונך למחוק את המשימה &quot;
                {info.row.original.title}&quot;? פעולה זו אינה הפיכה.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ביטול</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(info.row.original.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                מחק
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ),
      size: 60,
    },
  ];
}
