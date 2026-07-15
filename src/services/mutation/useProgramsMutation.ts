import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { programsApi, tasksApi } from "@/services/api";

export function useProgramsMutation() {
  const qc = useQueryClient();

  const createProgram = useMutation({
    mutationFn: (data: Record<string, unknown>) => programsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["programs"] });
      toast.success("Program berhasil dibuat");
    },
    onError: () => toast.error("Gagal membuat program"),
  });

  const updateProgram = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => programsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["programs"] });
      toast.success("Program berhasil diupdate");
    },
    onError: () => toast.error("Gagal mengupdate program"),
  });

  const deleteProgram = useMutation({
    mutationFn: (id: string) => programsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["programs"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Program berhasil dihapus");
    },
    onError: () => toast.error("Gagal menghapus program"),
  });

  const createTask = useMutation({
    mutationFn: (data: Record<string, unknown>) => tasksApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["programs"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Tugas berhasil dibuat");
    },
    onError: () => toast.error("Gagal membuat tugas"),
  });

  const deleteTask = useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["programs"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Tugas berhasil dihapus");
    },
    onError: () => toast.error("Gagal menghapus tugas"),
  });

  const updateTask = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => tasksApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["programs"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Tugas berhasil diupdate");
    },
    onError: () => toast.error("Gagal mengupdate tugas"),
  });

  return { createProgram, updateProgram, deleteProgram, createTask, updateTask, deleteTask };
}