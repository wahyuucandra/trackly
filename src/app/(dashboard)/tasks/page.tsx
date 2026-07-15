"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useMyTasks, useTaskFilters, useTaskUpdate } from "@/hooks/useTasks";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/common";
import { TaskGroup } from "@/components/features/tasks/TaskGroup";
import { TaskUpdateModal } from "@/components/features/tasks/TaskUpdateModal";
import type { Task } from "@/types";

export default function TasksPage() {
  const { data: session } = useSession();
  const user = session?.user;
  if (!user) return null;

  const { myTasks, allPrograms } = useMyTasks(user.area || [], user.id);
  const { filter, setFilter, grouped } = useTaskFilters(myTasks, user.id);
  const { updateTask } = useTaskUpdate();

  const [updateTaskItem, setUpdateTaskItem] = useState<Task | null>(null);

  const greeting = new Date().getHours() < 12 ? "Selamat Pagi" : new Date().getHours() < 18 ? "Selamat Siang" : "Selamat Malam";

  const handleSubmitUpdate = (data: { status: string; aoNote: string; evidenceUrl: string; submitForApproval: boolean }) => {
    if (!updateTaskItem) return;
    updateTask.mutate(
      { id: updateTaskItem.id, data },
      { onSuccess: () => setUpdateTaskItem(null) }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">{greeting}, {user?.name}</h1>
          <p className="text-muted-foreground text-sm">Kelola tugas Anda di sini</p>
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v ?? "")}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Semua Tugas" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Semua Tugas</SelectItem>
            <SelectItem value="notupdated">Belum Update</SelectItem>
            <SelectItem value="updated">Sudah Update</SelectItem>
            <SelectItem value="pending">Belum Verifikasi</SelectItem>
            <SelectItem value="approved">Terverifikasi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {Object.entries(grouped).map(([pid, progTasks]) => {
        const prog = allPrograms.find((p) => p.id === pid);
        return (
          <TaskGroup
            key={pid}
            programId={pid}
            tasks={progTasks}
            programName={prog?.name || "Program"}
            userArea={user.area || []}
            userId={user.id}
            onUpdateTask={setUpdateTaskItem}
          />
        );
      })}
      {!Object.keys(grouped).length && <EmptyState title="Belum ada tugas di area ini" />}

      <TaskUpdateModal
        task={updateTaskItem}
        open={!!updateTaskItem}
        onClose={() => setUpdateTaskItem(null)}
        isPending={updateTask.isPending}
        onSubmit={handleSubmitUpdate}
      />
    </div>
  );
}