import { redirect } from "next/navigation";

export default function ProjectsNotFound() {
  redirect("/tasks");
}
