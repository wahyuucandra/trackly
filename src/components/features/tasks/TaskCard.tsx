"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge, DeadlineBadge } from "@/components/common";
import { Check, Clock, X, ExternalLink, StickyNote, Edit, ChevronDown, ChevronUp, CheckCircle, XCircle } from "lucide-react";
import type { Task, TaskStatusHistory, ApprovalLog } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  dibuat: "bg-slate-400",
  belum: "bg-slate-400",
  berjalan: "bg-blue-500",
  selesai: "bg-purple-500",
  disetujui: "bg-green-500",
  ditolak: "bg-red-500",
};

const STATUS_LABELS: Record<string, string> = {
  dibuat: "Tugas dibuat oleh Admin",
  belum: "Belum dimulai",
  berjalan: "Sedang berjalan",
  selesai: "Menunggu Approval",
  disetujui: "Disetujui",
  ditolak: "Ditolak",
};

interface TaskCardProps {
  task: Task;
  userId: string;
  isApproved: boolean;
  isPending: boolean;
  onUpdate: (task: Task) => void;
}

export function TaskCard({ task, userId, isApproved, isPending, onUpdate }: TaskCardProps) {
  const status = (task.statuses || []).find((s) => s.userId === userId);
  const [showHistory, setShowHistory] = useState(false);

  // Filter history by this user — exclude approval/rejection statuses (handled by approval events)
  const myStatusHistory = (task.statusHistory || []).filter(
    (h) => h.userId === userId && h.status !== "disetujui" && h.status !== "ditolak"
  );

  // Approval events for this user (approve/reject by admin)
  const myApprovals = (task.approvals || []).filter((a) => a.userId === userId);

  // Merge and sort by date DESC
  const myHistory = useMemo(() => {
    const items: Array<{
      id: string;
      date: string;
      type: "submission" | "approval";
      label: string;
      notes: string | null;
      evidenceUrl: string | null;
      status: string;
      action?: string;
      adminName?: string;
    }> = [];

    myStatusHistory.forEach((h) => {
      items.push({
        id: h.id,
        date: h.createdAt || "",
        type: "submission",
        label: STATUS_LABELS[h.status] || h.status,
        notes: h.notes || null,
        evidenceUrl: h.evidenceUrl || null,
        status: h.status,
      });
    });

    myApprovals.forEach((a) => {
      const isApproved = a.action === "approve";
      items.push({
        id: a.id,
        date: a.createdAt || "",
        type: "approval",
        label: isApproved
          ? `${a.createdBy?.name || "Admin"} — Approve task`
          : `${a.createdBy?.name || "Admin"} — Tolak task`,
        notes: a.note || null,
        evidenceUrl: null,
        status: isApproved ? "disetujui" : "ditolak",
        action: a.action,
        adminName: a.createdBy?.name || "Admin",
      });
    });

    items.sort((a, b) => b.date.localeCompare(a.date));
    return items;
  }, [myStatusHistory, myApprovals]);

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
        {isApproved ? (
          <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <Check className="w-3 h-3" /> Selesai
          </span>
        ) : isPending ? (
          <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3" /> Menunggu
          </span>
        ) : (
          <Button size="sm" onClick={() => onUpdate(task)}>
            <Edit className="w-3 h-3" /> Update
          </Button>
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

      {/* History — expandable */}
      {myHistory.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            Riwayat ({myHistory.length})
          </button>
          {showHistory && (
            <div className="mt-2 relative pl-4 border-l-2 border-border space-y-3">
              {myHistory.map((h, i) => (
                <div key={h.id || i} className="relative">
                  <div className={`absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full border-2 border-background flex items-center justify-center ${h.type === "approval" ? (h.action === "approve" ? "bg-green-500" : "bg-red-500") : (STATUS_COLORS[h.status] || "bg-primary")}`}>
                    {h.type === "approval" && (
                      h.action === "approve"
                        ? <CheckCircle className="w-2.5 h-2.5 text-white" />
                        : <XCircle className="w-2.5 h-2.5 text-white" />
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {h.date
                      ? new Date(h.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", timeZone: "Asia/Jakarta" }) +
                        " " +
                        new Date(h.date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" })
                      : "-"}
                  </p>
                  <p className="text-xs font-medium">{h.label}</p>
                  {h.notes && <p className="text-[11px] text-muted-foreground">💬 {h.notes}</p>}
                  {h.evidenceUrl && (
                    <a href={h.evidenceUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> Bukti
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}