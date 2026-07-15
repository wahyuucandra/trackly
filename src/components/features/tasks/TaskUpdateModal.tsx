"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { ClipboardList, FileText, Link, X, Send, ChevronRight } from "lucide-react";
import type { Task } from "@/types";

interface TaskUpdateModalProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  isPending: boolean;
  onSubmit: (data: { status: string; aoNote: string; evidenceUrl: string; submitForApproval: boolean }) => void;
}

export function TaskUpdateModal({ task, open, onClose, isPending, onSubmit }: TaskUpdateModalProps) {
  const [updateStatus, setUpdateStatus] = useState("belum");
  const [updateNote, setUpdateNote] = useState("");
  const [updateEvidence, setUpdateEvidence] = useState("");

  // Sync form state when modal opens with new task
  useEffect(() => {
    if (open && task) {
      const status = (task.statuses || []).find(
        (s) => s.userId === task.pics?.[0]?.userId,
      );
      setUpdateStatus(status?.status || "belum");
      setUpdateNote(status?.notes || "");
      setUpdateEvidence(task.evidenceUrl || "");
    }
  }, [open, task]);

  const statusLabel =
    updateStatus === "belum" ? "Belum Dimulai"
    : updateStatus === "berjalan" ? "Sedang Berjalan"
    : updateStatus === "selesai" ? "Selesai — akan diajukan verifikasi"
    : "Belum Dimulai";

  const isSubmitForApproval = updateStatus === "selesai";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="p-0 overflow-hidden sm:max-w-[500px]" showCloseButton={false}>
        {/* ── Header ── */}
        <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-6 pt-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-background/60 transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/15 shadow-sm ring-1 ring-primary/10">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Update Tugas</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {task?.name ? (
                  <span className="font-semibold text-foreground">{task.name}</span>
                ) : (
                  "Perbarui status pengerjaan"
                )}
              </p>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="px-6 py-4 space-y-4">
          {/* Task Notes (program notes) */}
          {task?.notes && (
            <div className="relative rounded-xl border border-amber-200 bg-amber-50/50 overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
              <div className="p-4 pl-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center justify-center w-5 h-5 rounded-md bg-amber-100">
                    <FileText className="w-3 h-3 text-amber-700" />
                  </div>
                  <p className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">Catatan Program</p>
                </div>
                <p className="text-sm text-amber-900 leading-relaxed">{task.notes}</p>
              </div>
            </div>
          )}

          {/* Status Select */}
          <div>
            <label className="text-sm font-semibold mb-2 block">
              Status Pengerjaan
            </label>
            <Select value={updateStatus} onValueChange={(v) => setUpdateStatus(v ?? "belum")}>
              <SelectTrigger className="w-full h-12 rounded-xl group">
                <SelectValue>
                  <span className="flex items-center gap-2.5">
                    <span
                      className={[
                        "w-2.5 h-2.5 rounded-full shrink-0 transition-colors",
                        updateStatus === "belum" && "bg-gray-400",
                        updateStatus === "berjalan" && "bg-amber-400 animate-pulse",
                        updateStatus === "selesai" && "bg-green-500",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    />
                    {updateStatus === "belum" && "Belum Dimulai"}
                    {updateStatus === "berjalan" && "Sedang Berjalan"}
                    {updateStatus === "selesai" && "Selesai"}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="belum">
                  <span className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-400 shrink-0" />
                    <span>
                      <span className="font-medium">Belum Dimulai</span>
                      <span className="block text-[11px] text-muted-foreground">Tugas belum dikerjakan</span>
                    </span>
                  </span>
                </SelectItem>
                <SelectItem value="berjalan">
                  <span className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                    <span>
                      <span className="font-medium">Sedang Berjalan</span>
                      <span className="block text-[11px] text-muted-foreground">Sedang dalam proses pengerjaan</span>
                    </span>
                  </span>
                </SelectItem>
                <SelectItem value="selesai">
                  <span className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
                    <span>
                      <span className="font-medium">Selesai</span>
                      <span className="block text-[11px] text-muted-foreground">Ajukan untuk verifikasi PDO</span>
                    </span>
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            {isSubmitForApproval && (
              <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200">
                <ChevronRight className="w-3.5 h-3.5 text-green-600 shrink-0" />
                <p className="text-[11px] text-green-700">
                  Tugas akan diajukan untuk <span className="font-semibold">verifikasi PDO</span>
                </p>
              </div>
            )}
          </div>

          {/* Note Textarea */}
          <div>
            <label className="text-sm font-semibold mb-2 block">
              Catatan Perkembangan
            </label>
            <textarea
              className="w-full p-3.5 border border-border rounded-xl text-sm bg-background placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-ring/20 focus:border-primary/30 outline-none transition-all resize-none"
              rows={3}
              value={updateNote}
              onChange={(e) => setUpdateNote(e.target.value)}
              placeholder="Jelaskan perkembangan yang sudah dilakukan..."
            />
          </div>

          {/* Evidence URL */}
          <div>
            <label className="text-sm font-semibold mb-2 block">
              Link Bukti
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                <Link className="w-4 h-4 text-muted-foreground" />
              </div>
              <input
                className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm bg-background placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-ring/20 focus:border-primary/30 outline-none transition-all"
                value={updateEvidence}
                onChange={(e) => setUpdateEvidence(e.target.value)}
                placeholder="https://drive.google.com/..."
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              URL gambar, dokumen, atau link pendukung lainnya
            </p>
          </div>
        </div>

        {/* ── Footer ── */}
        <DialogFooter className="px-6 py-8 border-t bg-muted/30 gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
            Batal
          </Button>
          <Button
            onClick={() =>
              onSubmit({
                status: updateStatus,
                aoNote: updateNote,
                evidenceUrl: updateEvidence,
                submitForApproval: isSubmitForApproval,
              })
            }
            disabled={isPending}
            className="flex-1 sm:flex-none shadow-sm shadow-primary/20"
          >
            <Send className="w-4 h-4 mr-1.5" />
            {isPending ? "Mengirim..." : "Kirim"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}