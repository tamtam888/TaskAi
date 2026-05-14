import { redirect } from "next/navigation";

export default function TasksNotFound() {
  redirect("/tasks");
}
