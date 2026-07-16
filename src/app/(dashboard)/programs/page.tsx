"use client";

import { useState, useEffect, useMemo } from "react";
import { useProgramList, useProgramFilters, useProgramMutations, useProgramForm, getProgramProgress } from "@/hooks/usePrograms";
import { useUserList } from "@/hooks/useUsers";
import { useGcmList, useAreaMap } from "@/hooks/useGcm";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common";
import { ProgramsSkeleton } from "@/components/features/programs/ProgramsSkeleton";
import { ProgramCard } from "@/components/features/programs/ProgramCard";
import { ProgramFilterBar } from "@/components/features/programs/ProgramFilterBar";
import { ProgramFormModal } from "@/components/features/programs/ProgramFormModal";
import { TaskFormModal } from "@/components/features/programs/TaskFormModal";
import { TaskHistoryModal } from "@/components/features/programs/TaskHistoryModal";
import { DeleteConfirmModal } from "@/components/features/users/DeleteConfirmModal";
import { Plus } from "lucide-react";
import type { Program, Task } from "@/types";

export default function ProgramsPage() {
  const { programs: allPrograms, isLoading: progLoading } = useProgramList();
  const { users: allUsers, isLoading: userLoading } = useUserList();
  const { gcm, isLoading: gcmLoading } = useGcmList();
  const areaMap = useAreaMap();

  const isLoading = progLoading || userLoading || gcmLoading;

  const allAreas = gcm.filter((g) => g.flag_active).map((g) => g.cd_value);

  const {
    filterType, filterAreas, filterSearch,
    visible, hasMore, loadMore, hasFilters,
    handleFilterChange, handleReset,
  } = useProgramFilters(allPrograms, allAreas);

  const { createProgram, updateProgram, deleteProgram, createTask, updateTask, deleteTask } = useProgramMutations();
  const { formData, setFormData, jadwal, setJadwal, aoIds, setAoIds, resetForm, fillForm, addJadwal, removeJadwal, updateJadwal, buildPayload } = useProgramForm();

  const [programModalOpen, setProgramModalOpen] = useState(false);
  const [editProgram, setEditProgram] = useState<Program | null>(null);

  // Task modal
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskProgramId, setTaskProgramId] = useState("");

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<{ type: "program" | "task"; id: string; name: string } | null>(null);

  // Edit task
  const [editTaskItem, setEditTaskItem] = useState<Task | null>(null);

  // History modal
  const [historyTask, setHistoryTask] = useState<Task | null>(null);

  const aoUsers = allUsers.filter((u) => u.role === "AO");

  // Get AO users for the currently selected program (for task PIC filter)
  const taskProgramAOUsers = useMemo(() => {
    if (!taskProgramId) return aoUsers;
    const prog = allPrograms.find((p) => p.id === taskProgramId);
    if (!prog || !prog.aos?.length) return aoUsers;
    const aoIds = new Set(prog.aos.map((a) => a.userId));
    return aoUsers.filter((u) => aoIds.has(u.id));
  }, [taskProgramId, allPrograms, aoUsers]);

  // User name map for history modal
  const userNameMap = new Map(allUsers.map((u) => [u.id, u.name]));

  const handleSaveProgram = () => {
    if (!formData.name || !jadwal.some((j) => j.area)) return;
    const payload = buildPayload();
    if (editProgram) {
      updateProgram.mutate({ id: editProgram.id, data: payload });
    } else {
      createProgram.mutate(payload);
    }
  };

  const handleSaveTask = (data: { programId: string; name: string; deadline: string; notes: string; picIds: string[] }) => {
    if (editTaskItem) {
      updateTask.mutate({ id: editTaskItem.id, data: { name: data.name, deadline: data.deadline, notes: data.notes, picIds: data.picIds } });
    } else {
      createTask.mutate(data);
    }
  };

  useEffect(() => {
    if (createProgram.isSuccess || updateProgram.isSuccess) {
      setProgramModalOpen(false);
      resetForm();
    }
  }, [createProgram.isSuccess, updateProgram.isSuccess]);

  useEffect(() => {
    if (createTask.isSuccess || updateTask.isSuccess) { setTaskModalOpen(false); setEditTaskItem(null); }
  }, [createTask.isSuccess, updateTask.isSuccess]);

  const openCreate = () => { setEditProgram(null); resetForm(); setProgramModalOpen(true); };
  const openEdit = (prog: Program) => { setEditProgram(prog); fillForm(prog); setProgramModalOpen(true); };
  const openAddTask = (id: string) => { setTaskProgramId(id); setTaskModalOpen(true); };
  const openDeleteProgram = (prog: Program) => setDeleteTarget({ type: "program", id: prog.id, name: prog.name });
  const openDeleteTask = (task: { id: string; name: string }) => setDeleteTarget({ type: "task", id: task.id, name: task.name });

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "program") deleteProgram.mutate(deleteTarget.id);
    else deleteTask.mutate(deleteTarget.id);
    setDeleteTarget(null);
  };

  if (isLoading) return <ProgramsSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">Program</h1>
          <p className="text-muted-foreground text-sm">Kelola program dan tugas</p>
        </div>
        <Button onClick={openCreate} size="lg" className="gap-2 px-5">
          <Plus className="w-4 h-4" /> Buat Program
        </Button>
      </div>

      <ProgramFilterBar
        filterType={filterType}
        filterAreas={filterAreas}
        filterSearch={filterSearch}
        allAreas={allAreas}
        areaMap={areaMap}
        hasFilters={hasFilters}
        onChange={handleFilterChange}
        onReset={handleReset}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {visible.map((prog) => (
          <ProgramCard
            key={prog.id}
            program={prog}
            progress={getProgramProgress(prog)}
            areaMap={areaMap}
            onAddTask={openAddTask}
            onEdit={openEdit}
            onDelete={() => openDeleteProgram(prog)}
            onEditTask={(task) => { setEditTaskItem(task); setTaskModalOpen(true); }}
            onDeleteTask={(id) => {
              const task = prog.tasks?.find((t) => t.id === id);
              if (task) openDeleteTask(task);
            }}
            onShowHistory={setHistoryTask}
          />
        ))}
        {hasMore && (
          <div className="md:col-span-2 text-center pt-2">
            <Button variant="outline" onClick={loadMore} className="gap-2">Tampilkan Lebih Banyak</Button>
          </div>
        )}
        {!visible.length && (
          <div className="md:col-span-2">
            <EmptyState
              title={hasFilters ? "Tidak ada program dengan filter yang dipilih" : "Belum ada program"}
              description="Buat program baru untuk memulai"
            />
          </div>
        )}
      </div>

      <ProgramFormModal
        open={programModalOpen}
        onOpenChange={setProgramModalOpen}
        editProgram={editProgram}
        formData={formData}
        setFormData={setFormData}
        jadwal={jadwal}
        setJadwal={setJadwal}
        aoIds={aoIds}
        setAoIds={setAoIds}
        allAreas={allAreas}
        areaMap={areaMap}
        aoUsers={aoUsers}
        onSave={handleSaveProgram}
        isPending={createProgram.isPending || updateProgram.isPending}
      />

      <TaskFormModal
        open={taskModalOpen}
        onOpenChange={(v) => { setTaskModalOpen(v); if (!v) setEditTaskItem(null); }}
        programId={taskProgramId}
        aoUsers={taskProgramAOUsers}
        onSave={handleSaveTask}
        editTask={editTaskItem}
        isPending={createTask.isPending || updateTask.isPending}
      />

      <DeleteConfirmModal
        open={!!deleteTarget}
        username={deleteTarget?.name || ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isPending={deleteProgram.isPending || deleteTask.isPending}
      />

      <TaskHistoryModal
        open={!!historyTask}
        onOpenChange={() => setHistoryTask(null)}
        task={historyTask}
        userMap={userNameMap}
      />
    </div>
  );
}