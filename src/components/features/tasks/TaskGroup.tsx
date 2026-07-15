"use client";

import { useState } from "react";
import { TaskCard } from "@/components/features/tasks/TaskCard";
import { StatusBadge, VariantBadge } from "@/components/common";
import { Progress } from "@/components/ui/progress";
import { Folder, MapPin, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import type { Task } from "@/types";

interface TaskGroupProps {
  programId: string;
  tasks: Task[];
  programName: string;
  programType?: string;
  programNotes?: string | null;
  programAreas?: string[];
  programProgress?: number;
  userArea: string[];
  userId: string;
  defaultExpanded?: boolean;
  onUpdateTask: (task: Task) => void;
}

export function TaskGroup({
  programId,
  tasks,
  programName,
  programType,
  programNotes,
  programAreas,
  programProgress,
  userArea,
  userId,
  defaultExpanded = false,
  onUpdateTask,
}: TaskGroupProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-card rounded-[20px] border border-border p-5 md:p-6 shadow-[0_4px_16px_rgba(15,23,42,.04)]">
      {/* Head */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-base font-bold flex items-center gap-2">
          <Folder className="w-4 h-4 text-primary shrink-0" />
          <span className="truncate">{programName || "Program"}</span>
        </h3>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[13px] text-muted-foreground mb-2">
        {programType && (
          <VariantBadge variant={programType === "Akademik" ? "green" : "blue"}>
            {programType}
          </VariantBadge>
        )}
        {programAreas && programAreas.length > 0 && (
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            {programAreas.slice(0, 2).join(", ")}
            {programAreas.length > 2 && (
              <span className="text-muted-foreground/60 ml-0.5">
                +{programAreas.length - 2}
              </span>
            )}
          </span>
        )}
      </div>

      {/* Notes */}
      {programNotes && (
        <p className="text-[13px] text-muted-foreground mb-2.5 flex items-start gap-1.5">
          <ExternalLink className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-40" />
          {programNotes}
        </p>
      )}

      {/* Progress */}
      {programProgress !== undefined && (
        <div className="mb-2">
          <Progress value={programProgress} className="h-[10px] rounded-full" />
          <span className="text-xs text-muted-foreground block text-left mt-0.5">
            {programProgress}% selesai · {tasks.length} tugas
          </span>
        </div>
      )}

      {/* Tasks — expand/collapse */}
      {tasks.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[13px] font-semibold text-muted-foreground">Daftar Tugas ({tasks.length})</p>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {expanded ? "Sembunyikan" : "Lihat Semua"}
            </button>
          </div>

          {expanded && (
            <div className="space-y-2.5">
              {tasks.map((task) => {
                const status = (task.statuses || []).find((s) => s.userId === userId);
                const isApproved = status?.isApproved ?? false;
                const isPending = (status?.isPendingApproval && !isApproved) ?? false;
                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    userId={userId}
                    isApproved={isApproved}
                    isPending={isPending}
                    onUpdate={onUpdateTask}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {tasks.length === 0 && (
        <div className="mt-3 pt-3 border-t border-border text-[13px] text-muted-foreground italic flex items-center gap-1.5">
          <Folder className="w-3.5 h-3.5 opacity-40" />
          Belum ada tugas di program ini.
        </div>
      )}
    </div>
  );
}