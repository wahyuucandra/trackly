import { useQuery } from "@tanstack/react-query";
import { tasksApi } from "@/services/api";
import type { Task } from "@/types";

export function useTasksQuery() {
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: tasksApi.getAll,
    staleTime: 5_000,
  });
  return { tasks: Array.isArray(tasks) ? tasks : [], isLoading };
}