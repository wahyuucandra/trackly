"use client";

import { Button } from "@/components/ui/button";
import { StatusBadge, DeadlineBadge } from "@/components/common";
import { Check, Clock, X, ExternalLink, StickyNote, Edit } from "lucide-react";
import type { Task } from "@/types";

interface TaskCardProps {
  task: Task;
  userId: string;
  isApproved: boolean;
  isPending: boolean;
  onUpdate: (task: Task) => void;
}

export function TaskCard({ task, userId, isApproved, isPending, onUpdate }: TaskCardProps) {
  const status = (task.statuses || []).find((s) => s.userId === userId);

  return (
    <div className="bg-card p-4 rounded-xl border border-border border-l-[3px] border-l-primary hover:shadow-sm transition-shadow">
      <div className="flex justify-between gap-2 mb-1">
        <span className="font-semibold">{task.name}</span>
        <StatusBadge status={status?.status || "belum"} isApproved={isApproved} />
      </div>

      {task.notes && (
        <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
          <StickyNote className="w-3 h-3" /> {task.notes}
        </p>
      )}

      {status?.notes && (
        <div className="bg-secondary p-3 rounded-xl mb-2">
          <p className="text-xs font-semibold text-muted-foreground mb-1">Catatan Anda:</p>
          <p className="text-sm">{status.notes}</p>
        </div>
      )}

      <div className="flex justify-between flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2">
          <DeadlineBadge deadline={task.deadline} />
          {task.evidenceUrl && (
            <a href={task.evidenceUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 flex items-center gap-1 hover:underline">
              <ExternalLink className="w-3 h-3" /> Bukti
            </a>
          )}
        </div>
        {!isApproved ? (
          <Button size="sm" onClick={() => onUpdate(task)}>
            <Edit className="w-3 h-3" /> Update
          </Button>
        ) : (
          <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <Check className="w-3 h-3" /> Selesai
          </span>
        )}
      </div>

      {isPending && (
        <p className="mt-2 text-sm text-amber-600 flex items-center gap-1">
          <Clock className="w-3 h-3" /> Menunggu verifikasi PDO...
        </p>
      )}

      {status?.rejectionNote && (
        <div className="mt-2 bg-red-50 border border-red-200 rounded-xl p-3">
          <p className="text-xs font-semibold text-red-600 uppercase mb-1 flex items-center gap-1">
            <X className="w-3 h-3" /> Ditolak
          </p>
          <p className="text-sm text-red-800">{status.rejectionNote}</p>
        </div>
      )}
    </div>
  );
}