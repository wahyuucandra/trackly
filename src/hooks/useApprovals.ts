"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { toast } from "sonner";

export function useApprovalList() {
  const { data, isLoading } = useQuery({
    queryKey: ["approvals"],
    queryFn: () => api.get("/approvals").then((r) => r.data),
    staleTime: 15_000,
  });

  return {
    pending: data?.pending || [],
    history: data?.history || [],
    isLoading,
  };
}

export function useApprovalMutations() {
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: (data: { taskId: string; userId: string }) =>
      api.post("/approvals", { ...data, action: "approve" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
      toast.success("Berhasil diverifikasi");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (data: { taskId: string; userId: string; note: string }) =>
      api.post("/approvals", { ...data, action: "reject" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Tugas ditolak");
    },
  });

  const deleteHistoryMutation = useMutation({
    mutationFn: (id?: string) => api.delete(`/approvals${id ? `?id=${id}` : ""}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
      toast.success("Riwayat dihapus");
    },
  });

  return { approveMutation, rejectMutation, deleteHistoryMutation };
}