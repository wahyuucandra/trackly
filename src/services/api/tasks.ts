import { api } from "@/lib/axios";
import type { Task } from "@/types";

export const tasksApi = {
  getAll: () => api.get<Task[]>("/tasks").then(r => r.data),
  create: (data: Record<string, unknown>) => api.post<Task>("/tasks", data).then(r => r.data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/tasks/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/tasks/${id}`).then(r => r.data),
};