"use client";

import { useState, useMemo } from "react";
import type { Program, Task } from "@/types";

// Re-export from services
export { useProgramsQuery as useProgramList } from "@/services/query";
export { useProgramsMutation as useProgramMutations } from "@/services/mutation";

export function useProgramFilters(allPrograms: Program[], gcmAreas: string[]) {
  const [filterType, setFilterType] = useState("");
  const [filterAreas, setFilterAreas] = useState<string[]>([]);
  const [filterSearch, setFilterSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);

  const filtered = useMemo(() => {
    let result = allPrograms;
    if (filterSearch) result = result.filter((p) => p.name.toLowerCase().includes(filterSearch.toLowerCase()));
    if (filterType) result = result.filter((p) => p.type === filterType);
    if (filterAreas.length > 0) result = result.filter((p) => (p.jadwal || []).some((j) => filterAreas.includes(j.area)));
    return result;
  }, [allPrograms, filterType, filterAreas, filterSearch]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const loadMore = () => setVisibleCount((prev) => prev + 6);
  const resetVisible = () => setVisibleCount(6);

  const handleFilterChange = (partial: { type?: string; areas?: string[]; search?: string }) => {
    if (partial.type !== undefined) setFilterType(partial.type);
    if (partial.areas !== undefined) setFilterAreas(partial.areas);
    if (partial.search !== undefined) setFilterSearch(partial.search);
    resetVisible();
  };

  const handleReset = () => {
    setFilterType("");
    setFilterAreas([]);
    setFilterSearch("");
    resetVisible();
  };

  const hasFilters = filterAreas.length > 0 || filterType !== "" || filterSearch !== "";

  return { filterType, filterAreas, filterSearch, filtered, visible, hasMore, loadMore, hasFilters, handleFilterChange, handleReset };
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

// ─── Form Hook ───────────────────────────────────────────────

interface JadwalEntry {
  area: string;
  startDate: string;
  endDate: string;
}

export function useProgramForm() {
  const [formData, setFormData] = useState({ name: "", type: "Program Development", notes: "" });
  const [jadwal, setJadwal] = useState<JadwalEntry[]>([{ area: "", startDate: "", endDate: "" }]);
  const [aoIds, setAoIds] = useState<string[]>([]);

  const resetForm = () => {
    setFormData({ name: "", type: "Program Development", notes: "" });
    setJadwal([{ area: "", startDate: "", endDate: "" }]);
    setAoIds([]);
  };

  const fillForm = (prog: Program) => {
    setFormData({ name: prog.name, type: prog.type, notes: prog.notes || "" });
    const jadwalList = (prog.jadwal || []).length > 0
      ? prog.jadwal.map((j) => ({
          area: j.area,
          startDate: j.startDate?.split("T")[0] || "",
          endDate: j.endDate?.split("T")[0] || "",
        }))
      : [{ area: "", startDate: "", endDate: "" }];
    setJadwal(jadwalList);
    setAoIds((prog.aos || []).map((a) => a.userId));
  };

  const addJadwal = () => setJadwal((prev) => [...prev, { area: "", startDate: "", endDate: "" }]);
  const removeJadwal = (idx: number) => setJadwal((prev) => prev.filter((_, i) => i !== idx));
  const updateJadwal = (idx: number, field: keyof JadwalEntry, value: string) =>
    setJadwal((prev) => prev.map((j, i) => (i === idx ? { ...j, [field]: value } : j)));

  const buildPayload = () => ({
    name: formData.name,
    type: formData.type,
    notes: formData.notes || null,
    jadwal: jadwal.filter((j) => j.area),
    aoIds: aoIds.length > 0 ? aoIds : undefined,
  });

  return {
    formData, setFormData,
    jadwal, setJadwal,
    aoIds, setAoIds,
    resetForm, fillForm,
    addJadwal, removeJadwal, updateJadwal,
    buildPayload,
  };
}