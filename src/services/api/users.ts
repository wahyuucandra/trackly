import { api } from "@/lib/axios";
import type { User } from "@/types";

export const usersApi = {
  getAll: () => api.get<User[]>("/users").then(r => r.data),
  create: (data: Record<string, unknown>) => api.post("/users", data).then(r => r.data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/users/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/users/${id}`).then(r => r.data),
};