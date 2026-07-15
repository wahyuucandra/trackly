"use client";

import { useMemo, useState } from "react";
import { useProgramsQuery } from "@/services/query/useProgramsQuery";
import { useTasksQuery } from "@/services/query/useTasksQuery";
import type { Program, Task } from "@/types";

// Re-export from services
export { useTasksMutation as useTaskUpdate } from "@/services/mutation";

export function useMyTasks(userArea: string[], userId: string) {
  const { programs: allPrograms, isLoading: programsLoading } = useProgramsQuery();
  const { tasks: allTasks, isLoading: tasksLoading } = useTasksQuery();

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

  return { myTasks, allPrograms, isLoading: programsLoading || tasksLoading };
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