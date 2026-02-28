"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";

const schema = z.object({
  name: z.string().min(1, "שם הפרויקט הוא שדה חובה"),
});

type FormData = z.infer<typeof schema>;

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: (project: Project) => void;
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  onProjectCreated,
}: CreateProjectDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
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

    const { data: project, error } = await supabase
      .from("projects")
      .insert({ name: data.name.trim(), user_id: user.id })
      .select()
      .single();

    if (error || !project) {
      toast.error("שגיאה ביצירת הפרויקט");
      setIsLoading(false);
      return;
    }

    toast.success("הפרויקט נוצר בהצלחה");
    onProjectCreated(project as Project);
    reset();
    onOpenChange(false);
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-[380px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>יצירת פרויקט</DialogTitle>
          <DialogDescription>הוסף שם לפרויקט החדש שלך</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-1">
          <div className="space-y-2">
            <Label htmlFor="new-project-name">שם הפרויקט *</Label>
            <Input
              id="new-project-name"
              placeholder="לדוגמה: עבודה, אישי..."
              {...register("name")}
              autoFocus
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="flex justify-start gap-3 pt-1">
            <Button type="submit" disabled={isLoading} className="bg-violet-600 hover:bg-violet-700 rounded-xl">
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  יוצר...
                </>
              ) : (
                "צור"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => { reset(); onOpenChange(false); }}
              className="rounded-xl border-violet-200 hover:bg-violet-50"
            >
              ביטול
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
