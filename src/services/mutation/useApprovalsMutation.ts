import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { approvalsApi } from "@/services/api";

export function useApprovalsMutation() {
  const qc = useQueryClient();

  const approve = useMutation({
    mutationFn: ({ taskId, userId }: { taskId: string; userId: string }) =>
      approvalsApi.approve(taskId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["approvals"] });
      toast.success("Berhasil diverifikasi");
    },
  });

  const reject = useMutation({
    mutationFn: ({ taskId, userId, note }: { taskId: string; userId: string; note: string }) =>
      approvalsApi.reject(taskId, userId, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["approvals"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Tugas ditolak");
    },
  });

  const deleteHistory = useMutation({
    mutationFn: (id?: string) => approvalsApi.deleteHistory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["approvals"] });
      toast.success("Riwayat dihapus");
    },
  });

  return { approveMutation: approve, rejectMutation: reject, deleteHistoryMutation: deleteHistory };
}