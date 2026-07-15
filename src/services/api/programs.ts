import { api } from "@/lib/axios";
import type { Program } from "@/types";

export const programsApi = {
  getAll: () => api.get<Program[]>("/programs").then(r => r.data),
  create: (data: Record<string, unknown>) => api.post<Program>("/programs", data).then(r => r.data),
  update: (id: string, data: Record<string, unknown>) => api.patch<Program>(`/programs/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/programs/${id}`).then(r => r.data),
};