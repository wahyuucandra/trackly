"use client";

import { TaskCard } from "@/components/features/tasks/TaskCard";
import { formatDate } from "@/utils/formatters";
import { Folder, MapPin } from "lucide-react";
import type { Task } from "@/types";

interface TaskGroupProps {
  programId: string;
  tasks: Task[];
  programName: string;
  userArea: string[];
  userId: string;
  onUpdateTask: (task: Task) => void;
}

export function TaskGroup({ programId, tasks, programName, userArea, userId, onUpdateTask }: TaskGroupProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap bg-card p-3 rounded-xl border border-border">
        <Folder className="w-4 h-4 text-muted-foreground" />
        <span className="font-semibold">{programName || "Program"}</span>
      </div>
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
  );
}