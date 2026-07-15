"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import type { Program, Task } from "@/types";

export function useMyTasks(userArea: string[], userId: string) {
  const { data: programs } = useQuery<Program[]>({
    queryKey: ["programs"],
    queryFn: () => api.get("/programs").then((r) => r.data),
    staleTime: 30_000,
  });

  const { data: tasks } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: () => api.get("/tasks").then((r) => r.data),
    staleTime: 30_000,
  });

  const allPrograms = Array.isArray(programs) ? programs : [];
  const allTasks = Array.isArray(tasks) ? tasks : [];

  const myTasks = useMemo(() =>
    allTasks.filter((t) => {
      const prog = allPrograms.find((p) => p.id === t.programId);
      if (!prog) return false;
      const progAreas = (prog.jadwal || []).map((j) => j.area);
      if (!progAreas.some((a) => userArea.includes(a))) return false;
      const pics = (t.pics || []).map((p) => p.userId);
      if (pics.length && !pics.includes(userId)) return false;
      return true;
    }),
    [allTasks, allPrograms, userArea, userId]
  );

  return { myTasks, allPrograms };
}

export function useTaskFilters(myTasks: Task[], userId: string) {
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    if (filter === "updated") return myTasks.filter((t) => (t.statuses || []).some((s) => s.userId === userId && s.notes));
    if (filter === "notupdated") return myTasks.filter((t) => !(t.statuses || []).some((s) => s.userId === userId && s.notes));
    if (filter === "approved") return myTasks.filter((t) => (t.statuses || []).some((s) => s.userId === userId && s.isApproved));
    if (filter === "pending") return myTasks.filter((t) => (t.statuses || []).some((s) => s.userId === userId && !s.isApproved));
    return myTasks;
  }, [myTasks, filter, userId]);

  const grouped = useMemo(() => {
    const groups: Record<string, Task[]> = {};
    filtered.forEach((t) => {
      if (!groups[t.programId]) groups[t.programId] = [];
      groups[t.programId].push(t);
    });
    return groups;
  }, [filtered]);

  return { filter, setFilter, filtered, grouped };
}

export function useTaskUpdate() {
  const queryClient = useQueryClient();

  const updateTask = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => api.patch(`/tasks/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Tugas berhasil diupdate");
    },
  });

  return { updateTask };
}