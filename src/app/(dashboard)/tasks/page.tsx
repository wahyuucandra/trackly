"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useMyTasks, useTaskUpdate } from "@/hooks/useTasks";
import { getProgramProgress } from "@/hooks/usePrograms";
import { useAreaMap } from "@/hooks/useGcm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multiselect";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common";
import { TaskGroup } from "@/components/features/tasks/TaskGroup";
import { TaskUpdateModal } from "@/components/features/tasks/TaskUpdateModal";
import { Search } from "lucide-react";
import type { Task } from "@/types";

const STATUS_OPTIONS = [
  { value: "notupdated", label: "Belum Update" },
  { value: "belum", label: "Belum Dimulai" },
  { value: "berjalan", label: "Sedang Berjalan" },
  { value: "selesai", label: "Menunggu Verifikasi" },
  { value: "approved", label: "Terverifikasi" },
];

const ITEMS_PER_PAGE = 6;

function TaskGroupSkeleton() {
  return (
    <div className="bg-card rounded-[20px] border border-border p-5 md:p-6">
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="w-5 h-5 rounded-md" />
        <Skeleton className="h-5 w-2/3" />
      </div>
      <Skeleton className="h-4 w-20 mb-3 rounded-full" />
      <Skeleton className="h-3 w-full mb-1.5" />
      <Skeleton className="h-3 w-3/4 mb-3" />
      <Skeleton className="h-[10px] w-full rounded-full mb-1" />
      <Skeleton className="h-3 w-28" />
    </div>
  );
}

export default function TasksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const expandProgramId = searchParams.get("expand");

  const user = session?.user;
  const area = user?.area ?? [];
  const userId = user?.id ?? "";

  const { myTasks, allPrograms, isLoading: tasksLoading } = useMyTasks(area, userId);
  const { updateTask } = useTaskUpdate();
  const areaMap = useAreaMap();

  const [updateTaskItem, setUpdateTaskItem] = useState<Task | null>(null);
  const [searchProgram, setSearchProgram] = useState("");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading" || !user) return null;

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let result = myTasks;

    if (statusFilters.length > 0) {
      result = result.filter((t) => {
        const st = (t.statuses || []).find((s) => s.userId === userId);
        return statusFilters.some((f) => {
          if (f === "notupdated") return !st?.notes;
          if (f === "belum") return (!st || st.status === "belum") && !st?.isApproved && !st?.isPendingApproval;
          if (f === "berjalan") return st?.status === "berjalan" && !st?.isApproved && !st?.isPendingApproval;
          if (f === "selesai") return st?.isPendingApproval && !st?.isApproved;
          if (f === "approved") return st?.isApproved;
          return true;
        });
      });
    }

    return result;
  }, [myTasks, statusFilters, userId]);

  // Group by program
  const grouped = useMemo(() => {
    const groups: Record<string, Task[]> = {};
    filteredTasks.forEach((t) => {
      if (!groups[t.programId]) groups[t.programId] = [];
      groups[t.programId].push(t);
    });
    return groups;
  }, [filteredTasks]);

  // Filter programs by search
  const programEntries = useMemo(() => {
    const entries = Object.entries(grouped);
    if (!searchProgram) return entries;
    const q = searchProgram.toLowerCase();
    return entries.filter(([pid]) => {
      const prog = allPrograms.find((p) => p.id === pid);
      return prog?.name.toLowerCase().includes(q);
    });
  }, [grouped, searchProgram, allPrograms]);

  const visibleEntries = programEntries.slice(0, visibleCount);
  const hasMore = visibleCount < programEntries.length;

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
      </div>

      {/* Filters — clean bar, same width as 1 card */}
      <div className="bg-card rounded-2xl border border-border p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-[calc(50%-0.5rem)]">
        <MultiSelect
          label="Status"
          options={STATUS_OPTIONS.map((o) => o.value)}
          optionLabels={new Map(STATUS_OPTIONS.map((o) => [o.value, o.label]))}
          selected={statusFilters}
          onChange={(v) => { setStatusFilters(v); setVisibleCount(ITEMS_PER_PAGE); }}
          className="flex-1"
        />
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari program..."
            value={searchProgram}
            onChange={(e) => { setSearchProgram(e.target.value); setVisibleCount(ITEMS_PER_PAGE); }}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Program cards — 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {tasksLoading
          ? Array.from({ length: 4 }).map((_, i) => <TaskGroupSkeleton key={i} />)
          : visibleEntries.map(([pid, progTasks]) => {
              const prog = allPrograms.find((p) => p.id === pid);
              const jadwal = prog?.jadwal || [];
              const areas = [...new Set(jadwal.map((j) => areaMap.get(j.area) || j.area))];
              return (
                <TaskGroup
                  key={pid}
                  programId={pid}
                  tasks={progTasks}
                  programName={prog?.name || "Program"}
                  programType={prog?.type}
                  programNotes={prog?.notes}
                  programAreas={areas}
                  programProgress={prog ? getProgramProgress(prog) : undefined}
                  defaultExpanded={expandProgramId === pid}
                  userArea={area}
                  userId={userId}
                  onUpdateTask={setUpdateTaskItem}
                />
              );
            })
        }
      </div>

      {/* Load more */}
      {!tasksLoading && hasMore && (
        <div className="text-center pt-2">
          <Button variant="outline" onClick={() => setVisibleCount((c) => c + ITEMS_PER_PAGE)}>
            Tampilkan Lebih Banyak
          </Button>
        </div>
      )}

      {!tasksLoading && !programEntries.length && <EmptyState title="Belum ada tugas di area ini" />}

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