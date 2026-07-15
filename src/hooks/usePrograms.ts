"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import type { Program, Task, User as UserType } from "@/types";

export function useProgramList() {
  const { data: programs, isLoading } = useQuery<Program[]>({
    queryKey: ["programs"],
    queryFn: () => api.get("/programs").then((r) => r.data),
    staleTime: 30_000,
  });
  return { programs: Array.isArray(programs) ? programs : [], isLoading };
}

export function useProgramFilters(allPrograms: Program[]) {
  const [filterType, setFilterType] = useState("");
  const [filterArea, setFilterArea] = useState("");
  const [filterSearch, setFilterSearch] = useState("");

  const filtered = useMemo(() => {
    let result = allPrograms;
    if (filterSearch) result = result.filter((p) => p.name.toLowerCase().includes(filterSearch.toLowerCase()));
    if (filterType) result = result.filter((p) => p.type === filterType);
    if (filterArea) result = result.filter((p) => (p.jadwal || []).some((j) => j.area === filterArea));
    return result;
  }, [allPrograms, filterType, filterArea, filterSearch]);

  const allAreas = [...new Set(allPrograms.flatMap((p) => (p.jadwal || []).map((j) => j.area)))];

  return { filterType, setFilterType, filterArea, setFilterArea, filterSearch, setFilterSearch, filtered, allAreas };
}

export function useProgramMutations() {
  const queryClient = useQueryClient();

  const deleteProgram = useMutation({
    mutationFn: (id: string) => api.delete(`/programs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Program berhasil dihapus");
    },
  });

  const deleteTask = useMutation({
    mutationFn: (id: string) => api.delete(`/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Tugas berhasil dihapus");
    },
  });

  return { deleteProgram, deleteTask };
}

export function getProgramProgress(prog: Program) {
  const tasks = prog.tasks || [];
  if (!tasks.length) return 0;
  const done = tasks.filter((t) => (t.statuses || []).some((s) => s.isApproved)).length;
  return Math.round((done / tasks.length) * 100);
}

export function getTaskAOUsers(task: Task, prog: Program) {
  const pics = (task.pics || []).map((p) => p.userId);
  if (pics.length) return pics;
  return (prog.aos || []).map((a) => a.userId);
}