"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Clock, CheckCircle, XCircle, ExternalLink, StickyNote, Send } from "lucide-react";
import type { Task } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  dibuat: "📝 Tugas dibuat",
  belum: "Belum dimulai",
  berjalan: "Sedang berjalan",
  selesai: "Menunggu Approval",
  disetujui: "✅ Disetujui",
  ditolak: "❌ Ditolak",
};

interface TimelineEvent {
  type: "approval" | "submission";
  date: string;
  label: string;
  detail?: string | null;
  evidenceUrl?: string | null;
  icon: React.ReactNode;
  color: string;
}

interface TaskHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  userMap: Map<string, string>;
}

export function TaskHistoryModal({ open, onOpenChange, task, userMap }: TaskHistoryModalProps) {
  if (!task) return null;

  const events: TimelineEvent[] = [];

  // 1. Approval events (Admin actions)
  (task.approvals || []).forEach((a) => {
    const aoName = userMap.get(a.userId) || a.userId;
    const byName = a.createdBy?.name || "Admin";
    const isApproved = a.action === "approve";
    events.push({
      type: "approval",
      date: a.createdAt || "",
      label: isApproved ? `${byName} — Approve task` : `${byName} — Tolak task`,
      detail: isApproved
        ? (a.note ? `💬 ${a.note}` : `AO: ${aoName}`)
        : (a.note ? `💬 ${a.note}` : `AO: ${aoName}`),
      icon: isApproved ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />,
      color: isApproved ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50",
    });
  });

  // 2. AO Submission events (from TaskStatusHistory, exclude approval/rejection statuses)
  (task.statusHistory || []).forEach((h) => {
    // Skip approval/rejection statuses — handled by approval events above
    if (h.status === "disetujui" || h.status === "ditolak") return;
    const isDibuat = h.status === "dibuat";
    const adminName = task.createdBy?.name || "Admin";
    const aoName = h.user?.name || userMap.get(h.userId) || h.userId;
    events.push({
      type: "submission",
      date: h.createdAt || "",
      label: isDibuat
        ? `${adminName} — ${STATUS_LABELS[h.status] || h.status}`
        : `${aoName} — ${STATUS_LABELS[h.status] || h.status}`,
      detail: isDibuat
        ? `PIC: ${aoName}`
        : (h.notes || null),
      evidenceUrl: h.evidenceUrl || null,
      icon: isDibuat ? <StickyNote className="w-4 h-4" /> : <Send className="w-4 h-4" />,
      color: isDibuat ? "bg-primary text-primary-foreground" : "bg-blue-100 text-blue-600",
    });
  });

  // Sort by date DESC
  events.sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:min-w-[560px] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border bg-secondary/30">
          <DialogTitle className="text-lg flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            Riwayat Tugas
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1.5 ml-12">
            <span className="font-semibold text-foreground">{task.name}</span>
            {task.program?.name && <> — {task.program.name}</>}
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          {/* Admin Notes — always visible */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
            <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <StickyNote className="w-3.5 h-3.5" />
              Catatan Admin
            </p>
            <p className="text-sm text-amber-900">{task.notes || "Tidak ada catatan"}</p>
          </div>

          {/* Timeline */}
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Timeline
          </p>
          {events.length > 0 ? (
            <div className="relative pl-6 border-l-2 border-border space-y-5">
              {events.map((e, i) => (
                <div key={i} className="relative">
                  {/* Dot */}
                  <div className={`absolute -left-[29px] top-0.5 w-4 h-4 rounded-full border-2 border-background flex items-center justify-center ${e.color}`}>
                    {e.icon}
                  </div>
                  {/* Date */}
                  <p className="text-xs text-muted-foreground mb-0.5">
                    {e.date ? new Date(e.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }) + " " + new Date(e.date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }) : "-"}
                  </p>
                  {/* Label */}
                  <p className="text-sm font-medium">{e.label}</p>
                  {/* Detail */}
                  {e.detail && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      💬 {e.detail}
                    </p>
                  )}
                  {e.evidenceUrl && (
                    <a href={e.evidenceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 mt-0.5">
                      <ExternalLink className="w-3 h-3" /> Bukti
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">Belum ada riwayat</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}