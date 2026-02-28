"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { CreateProjectDialog } from "./create-project-dialog";
import type { Project, TaskWithDetails } from "@/lib/types";
import { getTodayString, isTodayOrFuture } from "@/lib/date-utils";

const taskSchema = z.object({
  title: z.string().min(1, "כותרת היא שדה חובה"),
  description: z.string().optional(),
  status: z.enum(["backlog", "in_progress", "done"]),
  priority: z.enum(["low", "medium", "high"]),
  project_id: z.string().optional(),
  due_date: z
    .string()
    .optional()
    .refine(
      (val) => !val || isTodayOrFuture(val),
      "תאריך יעד חייב להיות היום או בעתיד"
    ),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface AddTaskModalProps {
  projects: Project[];
  onTaskAdded: (task: TaskWithDetails) => void;
  onProjectCreated: (project: Project) => void;
}

export function AddTaskModal({ projects, onTaskAdded, onProjectCreated }: AddTaskModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [localProjects, setLocalProjects] = useState<Project[]>(projects);

  // Keep localProjects in sync when parent projects prop changes (e.g. new project added elsewhere)
  // We intentionally allow local additions to supersede parent for immediate UX

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      status: "backlog",
      priority: "medium",
    },
  });

  // Reset local projects when modal opens so it's fresh from parent
  const handleOpenChange = (o: boolean) => {
    setOpen(o);
    if (o) {
      setLocalProjects(projects);
    } else {
      reset();
    }
  };

  const handleProjectCreatedLocal = (project: Project) => {
    setLocalProjects((prev) => [...prev, project]);
    onProjectCreated(project);
    setValue("project_id", project.id);
  };

  const onSubmit = async (data: TaskFormData) => {
    setIsLoading(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("לא מחובר");
      setIsLoading(false);
      return;
    }

    const taskData = {
      title: data.title,
      description: data.description || null,
      status: data.status,
      priority: data.priority,
      project_id: data.project_id || null,
      due_date: data.due_date || null,
      user_id: user.id,
      completed_at: data.status === "done" ? new Date().toISOString() : null,
    };

    const { data: newTask, error: taskError } = await supabase
      .from("tasks")
      .insert(taskData)
      .select("*, project:projects(id, name)")
      .single();

    if (taskError || !newTask) {
      toast.error("שגיאה ביצירת המשימה");
      setIsLoading(false);
      return;
    }

    const fullTask: TaskWithDetails = {
      ...newTask,
      project: newTask.project || null,
      tags: [],
    };

    toast.success("המשימה נוצרה בהצלחה");
    onTaskAdded(fullTask);
    reset();
    setOpen(false);
    setIsLoading(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button className="gap-2 rounded-2xl px-6 bg-violet-600 hover:bg-violet-700 shadow-sm shadow-violet-200 font-semibold">
            <Plus className="h-4 w-4" />
            משימה חדשה
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[540px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>יצירת משימה חדשה</DialogTitle>
            <DialogDescription>מלא את הפרטים ליצירת משימה חדשה</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">כותרת *</Label>
              <Input
                id="title"
                placeholder="שם המשימה"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">תיאור</Label>
              <Textarea
                id="description"
                placeholder="תיאור המשימה (אופציונלי)"
                rows={3}
                {...register("description")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Status */}
              <div className="space-y-2">
                <Label>סטטוס</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="backlog">רשימת המתנה</SelectItem>
                        <SelectItem value="in_progress">בביצוע</SelectItem>
                        <SelectItem value="done">הושלם</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label>עדיפות</Label>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">נמוכה</SelectItem>
                        <SelectItem value="medium">בינונית</SelectItem>
                        <SelectItem value="high">גבוהה</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Project */}
              <div className="space-y-2">
                <Label>פרויקט</Label>
                <Controller
                  name="project_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || "none"}
                      onValueChange={(v) => {
                        if (v === "new_project") {
                          setCreateProjectOpen(true);
                        } else {
                          field.onChange(v === "none" ? undefined : v);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="ללא פרויקט" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">ללא פרויקט</SelectItem>
                        {localProjects.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                        <SelectItem
                          value="new_project"
                          className="text-violet-600 font-medium border-t mt-1 pt-2"
                        >
                          + צור פרויקט חדש
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label htmlFor="due_date">תאריך יעד</Label>
                <Input
                  id="due_date"
                  type="date"
                  dir="ltr"
                  min={getTodayString()}
                  {...register("due_date")}
                />
                {errors.due_date && (
                  <p className="text-sm text-red-500">{errors.due_date.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-start gap-3 pt-2">
              <Button type="submit" disabled={isLoading} className="bg-violet-600 hover:bg-violet-700 rounded-xl">
                {isLoading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    יוצר...
                  </>
                ) : (
                  "צור משימה"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset();
                  setOpen(false);
                }}
                className="rounded-xl border-violet-200 hover:bg-violet-50"
              >
                ביטול
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <CreateProjectDialog
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
        onProjectCreated={handleProjectCreatedLocal}
      />
    </>
  );
}
