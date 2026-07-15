"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/axios";
import { useProgramList, useProgramFilters, useProgramMutations, getProgramProgress } from "@/hooks/usePrograms";
import { useAreaMap } from "@/hooks/useGcm";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common";
import { ProgramCard } from "@/components/features/programs/ProgramCard";
import { ProgramFilterBar } from "@/components/features/programs/ProgramFilterBar";
import { Plus } from "lucide-react";
import type { User as UserType } from "@/types";

export default function ProgramsPage() {
  const { programs: allPrograms } = useProgramList();
  const { data: users } = useQuery<UserType[]>({ queryKey: ["users"], queryFn: () => api.get("/users").then((r) => r.data) });
  const { filterType, setFilterType, filterArea, setFilterArea, filterSearch, setFilterSearch, filtered, allAreas } = useProgramFilters(allPrograms);
  const { deleteProgram, deleteTask } = useProgramMutations();
  const areaMap = useAreaMap();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit" | "addTask">("create");
  const [editId, setEditId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Program</h1>
          <p className="text-muted-foreground text-sm">Kelola program dan tugas</p>
        </div>
        <Button onClick={() => { setModalType("create"); setEditId(null); setModalOpen(true); }}>
          <Plus className="w-4 h-4" /> Buat Program
        </Button>
      </div>

      <ProgramFilterBar
        filterType={filterType} setFilterType={setFilterType}
        filterArea={filterArea} setFilterArea={setFilterArea}
        filterSearch={filterSearch} setFilterSearch={setFilterSearch}
        allAreas={allAreas}
        areaMap={areaMap}
      />

      <div className="space-y-4">
        {filtered.map((prog) => (
          <ProgramCard
            key={prog.id}
            program={prog}
            progress={getProgramProgress(prog)}
            areaMap={areaMap}
            onAddTask={(id) => { setModalType("addTask"); setEditId(id); setModalOpen(true); }}
            onEdit={(id) => { setModalType("edit"); setEditId(id); setModalOpen(true); }}
            onDelete={deleteProgram.mutate}
            onDeleteTask={deleteTask.mutate}
          />
        ))}
        {!filtered.length && (
          <EmptyState
            title={filterSearch || filterType || filterArea ? "Tidak ada program dengan filter yang dipilih" : "Belum ada program"}
            description="Buat program baru untuk memulai"
          />
        )}
      </div>
    </div>
  );
}