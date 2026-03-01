"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Folder,
  FolderOpen,
  Pencil,
  Trash2,
  Check,
  X,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { CreateProjectDialog } from "@/components/tasks/create-project-dialog";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProjectWithCount extends Project {
  task_count: number;
}

interface ProjectsClientProps {
  initialProjects: ProjectWithCount[];
}

// ── Empty state ────────────────────────────────────────────────────────────
function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <FolderOpen className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-1">אין פרויקטים עדיין</h2>
      <p className="text-sm text-muted-foreground mb-6">צור פרויקט ראשון כדי לארגן את המשימות שלך</p>
      <Button
        onClick={onCreateClick}
        className="gap-2 rounded-2xl px-6 bg-primary hover:bg-primary/90 shadow-sm shadow-primary/20 font-semibold"
      >
        <Plus className="h-4 w-4" />
        פרויקט חדש
      </Button>
    </div>
  );
}

// ── Single project row ─────────────────────────────────────────────────────
function ProjectRow({
  project,
  onRenamed,
  onDeleted,
}: {
  project: ProjectWithCount;
  onRenamed: (id: string, newName: string) => void;
  onDeleted: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [nameValue, setNameValue] = useState(project.name);
  const [saving, setSaving] = useState(false);

  const saveRename = async () => {
    const trimmed = nameValue.trim();
    if (!trimmed) {
      setNameValue(project.name);
      setEditing(false);
      return;
    }
    if (trimmed === project.name) {
      setEditing(false);
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("projects")
      .update({ name: trimmed })
      .eq("id", project.id);
    if (error) {
      toast.error("שגיאה בשמירת השם");
      setNameValue(project.name);
    } else {
      toast.success("שם הפרויקט עודכן");
      onRenamed(project.id, trimmed);
    }
    setSaving(false);
    setEditing(false);
  };

  const handleDelete = async () => {
    const supabase = createClient();
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", project.id);
    if (error) {
      toast.error("שגיאה במחיקת הפרויקט");
      return;
    }
    toast.success("הפרויקט נמחק");
    onDeleted(project.id);
  };

  return (
    <Card className="group flex items-center gap-4 px-5 py-4 border border-border shadow-sm bg-card hover:border-border/80 hover:shadow-md transition-all">
      {/* Icon */}
      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Folder className="h-5 w-5 text-primary" />
      </div>

      {/* Name / Edit input */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex items-center gap-2">
            <Input
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={saveRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveRename();
                if (e.key === "Escape") {
                  setNameValue(project.name);
                  setEditing(false);
                }
              }}
              disabled={saving}
              autoFocus
              className="h-8 text-sm max-w-xs"
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-green-600 hover:bg-green-50"
              onClick={saveRename}
              disabled={saving}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-muted-foreground hover:bg-muted"
              onClick={() => {
                setNameValue(project.name);
                setEditing(false);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <span className="text-sm font-semibold text-foreground truncate block">
            {project.name}
          </span>
        )}
      </div>

      {/* Task count badge */}
      <span
        className={cn(
          "text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0",
          project.task_count > 0
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
        )}
      >
        {project.task_count} משימות
      </span>

      {/* Actions — visible on hover */}
      {!editing && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
            onClick={() => setEditing(true)}
            aria-label="שנה שם פרויקט"
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                aria-label="מחק פרויקט"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent dir="rtl">
              <AlertDialogHeader>
                <AlertDialogTitle>מחיקת פרויקט</AlertDialogTitle>
                <AlertDialogDescription>
                  האם אתה בטוח שברצונך למחוק את הפרויקט &quot;{project.name}&quot;?
                  {project.task_count > 0 && (
                    <span className="block mt-1 font-medium text-amber-600">
                      {project.task_count} משימות יינותקו מהפרויקט (לא יימחקו).
                    </span>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>ביטול</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  מחק
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </Card>
  );
}

// ── Main client component ──────────────────────────────────────────────────
export function ProjectsClient({ initialProjects }: ProjectsClientProps) {
  const [projects, setProjects] = useState<ProjectWithCount[]>(initialProjects);
  const [createOpen, setCreateOpen] = useState(false);

  const handleProjectCreated = (project: Project) => {
    setProjects((prev) => [...prev, { ...project, task_count: 0 }]);
  };

  const handleRenamed = (id: string, newName: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: newName } : p))
    );
  };

  const handleDeleted = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            פרויקטים
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
            נהל את הפרויקטים שלך
          </p>
        </div>
        {projects.length > 0 && (
          <Button
            onClick={() => setCreateOpen(true)}
            className="gap-2 rounded-2xl px-5 bg-primary hover:bg-primary/90 shadow-sm shadow-primary/20 font-semibold"
          >
            <Plus className="h-4 w-4" />
            פרויקט חדש
          </Button>
        )}
      </div>

      {/* List or empty state */}
      {projects.length === 0 ? (
        <EmptyState onCreateClick={() => setCreateOpen(true)} />
      ) : (
        <div className="flex flex-col gap-3">
          {projects.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              onRenamed={handleRenamed}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}

      <CreateProjectDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}
