import { api } from "@/lib/axios";

export const gcmApi = {
  getAll: () => api.get("/gcm").then(r => r.data),
};