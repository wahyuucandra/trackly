"use client";

import { useMemo } from "react";
import { useUsersQuery } from "@/services/query/useUsersQuery";
import { useProgramsQuery } from "@/services/query/useProgramsQuery";
import { useTasksQuery } from "@/services/query/useTasksQuery";
import type { Program, User as UserType } from "@/types";

export interface DashboardFilters {
  areas: string[];
  search: string;
}

export function getDefaultFilters(): DashboardFilters {
  return { areas: [], search: "" };
}

function isProgramActiveNow(p: Program): boolean {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return (p.jadwal || []).some((j) => {
    if (!j.startDate || !j.endDate) return false;
    const jStart = new Date(j.startDate);
    const jEnd = new Date(j.endDate);
    return jStart <= monthEnd && jEnd >= monthStart;
  });
}

export function usePDODashboard(filters: DashboardFilters = getDefaultFilters()) {
  const { programs, isLoading: progLoading } = useProgramsQuery();
  const { users, isLoading: userLoading } = useUsersQuery();
  const { tasks, isLoading: taskLoading } = useTasksQuery();

  const allPrograms = useMemo(
    () => (Array.isArray(programs) ? programs : []),
    [programs],
  );
  const allTasks = useMemo(
    () => (Array.isArray(tasks) ? tasks : []),
    [tasks],
  );
  const allUsers = useMemo(
    () => (Array.isArray(users) ? users : []),
    [users],
  );

  const allAreas = useMemo(
    () => [
      ...new Set(
        allPrograms.flatMap((p) => (p.jadwal || []).map((j) => j.area)),
      ),
    ],
    [allPrograms],
  );

  // Programs active in current month (always)
  const activePrograms = useMemo(
    () => allPrograms.filter((p) => isProgramActiveNow(p)),
    [allPrograms],
  );

  const aoUsers = useMemo(() => allUsers.filter((u) => u.role === "AO"), [allUsers]);

  // ── Global stats (StatCards + Chart) — always based on ALL active programs ──
  const globalStats = useMemo(() => {
    const activeProgramIds = new Set(activePrograms.map((p) => p.id));

    let selesai = 0, berjalan = 0, belum = 0;
    const programsForChart = activePrograms.filter((p) =>
      allTasks.some((t) => t.programId === p.id),
    );
    const isFallback = programsForChart.length === 0 && activePrograms.length > 0;

    const chartPrograms = isFallback
      ? activePrograms.filter((p) => allTasks.some((t) => t.programId === p.id))
      : programsForChart;

    chartPrograms.forEach((p) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const jadwal = p.jadwal || [];

      if (!jadwal.length) { belum++; return; }

      const allEnded = jadwal.every((j) => {
        if (!j.endDate) return false;
        return new Date(j.endDate + "T00:00:00+07:00") < today;
      });
      const anyStarted = jadwal.some((j) => {
        if (!j.startDate) return false;
        return new Date(j.startDate + "T00:00:00+07:00") <= today;
      });

      if (allEnded) selesai++;
      else if (anyStarted) berjalan++;
      else belum++;
    });

    const allMonthTasks = allTasks.filter((t) => activeProgramIds.has(t.programId));

    const now = new Date();
    return {
      month: now.getMonth(),
      year: now.getFullYear(),
      isFallback,
      aktifCount: chartPrograms.length,
      totalTugas: allMonthTasks.length,
      tugasSelesai: allMonthTasks.filter((t) =>
        (t.statuses || []).some((s) => s.isApproved),
      ).length,
      tugasPending: allMonthTasks.filter((t) =>
        (t.statuses || []).some((s) => s.isPendingApproval && !s.isApproved),
      ).length,
      slices: [
        { name: "Selesai", value: selesai, color: "#16a34a" },
        { name: "Berjalan", value: berjalan, color: "#2563eb" },
        { name: "Belum", value: belum, color: "#d1d5db" },
      ],
    };
  }, [activePrograms, allTasks]);

  // ── AO Summary (filtered by area + search) ──
  const aoSummary = useMemo(() => {
    const activeProgramIds = new Set(activePrograms.map((p) => p.id));

    let filteredAOs = aoUsers;

    if (filters.areas.length > 0) {
      filteredAOs = filteredAOs.filter((u) =>
        (u.area || []).some((a) => filters.areas.includes(a)),
      );
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filteredAOs = filteredAOs.filter((u) =>
        u.name.toLowerCase().includes(q),
      );
    }

    return filteredAOs
      .map((u) => {
        const aoTasks = allTasks.filter((t) => {
          if (!activeProgramIds.has(t.programId)) return false;
          const prog = activePrograms.find((p) => p.id === t.programId);
          if (!prog) return false;
          const progAreas = (prog.jadwal || []).map((j) => j.area);
          if (!progAreas.some((a) => (u.area || []).includes(a))) return false;
          const pics = (t.pics || []).map((p) => p.userId);
          if (pics.length && !pics.includes(u.id)) return false;
          return true;
        });
        const done = aoTasks.filter((t) =>
          (t.statuses || []).some((s) => s.userId === u.id && s.isApproved),
        ).length;
        const pct = aoTasks.length ? Math.round((done / aoTasks.length) * 100) : 0;
        return { name: u.name, area: u.area, total: aoTasks.length, done, pct };
      })
      .filter((row) => row.total > 0);
  }, [activePrograms, allTasks, aoUsers, filters.areas, filters.search]);

  const stats = useMemo(() => ({ ...globalStats, aoSummary }), [globalStats, aoSummary]);

  return {
    stats,
    isLoading: progLoading || userLoading || taskLoading,
  };
}

export function useAODashboard() {
  const { programs: allPrograms, isLoading: progLoading } = useProgramsQuery();
  const { tasks: allTasks, isLoading: taskLoading } = useTasksQuery();

  return { programs: allPrograms, tasks: allTasks, isLoading: progLoading || taskLoading };
}