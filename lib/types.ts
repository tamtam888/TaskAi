export type TaskStatus = "backlog" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Project {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
}

export interface Task {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  created_at: string;
  completed_at: string | null;
  project?: Project | null;
  tags?: Tag[];
}

export interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface TaskWithDetails extends Task {
  project: Project | null;
  tags: Tag[];
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: "רשימת המתנה",
  in_progress: "בביצוע",
  done: "הושלם",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "נמוכה",
  medium: "בינונית",
  high: "גבוהה",
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  backlog: "bg-slate-100 text-slate-600",
  in_progress: "bg-violet-100 text-violet-700",
  done: "bg-green-100 text-green-700",
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
};
