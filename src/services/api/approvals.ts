import { api } from "@/lib/axios";

export const approvalsApi = {
  getAll: () => api.get("/approvals").then(r => r.data),
  approve: (taskId: string, userId: string) =>
    api.post("/approvals", { taskId, userId, action: "approve" }).then(r => r.data),
  reject: (taskId: string, userId: string, note: string) =>
    api.post("/approvals", { taskId, userId, note, action: "reject" }).then(r => r.data),
  deleteHistory: (id?: string) =>
    api.delete(`/approvals${id ? `?id=${id}` : ""}`).then(r => r.data),
};