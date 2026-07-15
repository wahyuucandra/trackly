"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import type { Task } from "@/types";

interface TaskUpdateModalProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  isPending: boolean;
  onSubmit: (data: { status: string; aoNote: string; evidenceUrl: string; submitForApproval: boolean }) => void;
}

export function TaskUpdateModal({ task, open, onClose, isPending, onSubmit }: TaskUpdateModalProps) {
  const status = (task?.statuses || []).find((s) => s.userId === task?.pics?.[0]?.userId);
  const [updateStatus, setUpdateStatus] = useState(status?.status || "belum");
  const [updateNote, setUpdateNote] = useState(status?.notes || "");
  const [updateEvidence, setUpdateEvidence] = useState(task?.evidenceUrl || "");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Update Tugas</DialogTitle></DialogHeader>
        <div className="space-y-4">
          {task?.notes && (
            <div className="bg-secondary p-3 rounded-xl">
              <p className="text-xs font-semibold text-muted-foreground mb-1">Catatan:</p>
              <p className="text-sm">{task.notes}</p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium">Status</label>
            <Select value={updateStatus} onValueChange={(v) => setUpdateStatus(v ?? "belum")}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="belum">Belum dimulai</SelectItem>
                <SelectItem value="berjalan">Sedang berjalan</SelectItem>
                <SelectItem value="selesai">Selesai</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Catatan</label>
            <textarea className="w-full mt-1 p-3 border border-border rounded-xl text-sm bg-background focus:ring-2 focus:ring-ring/20 outline-none" rows={3} value={updateNote} onChange={(e) => setUpdateNote(e.target.value)} placeholder="Jelaskan perkembangan..." />
          </div>
          <div>
            <label className="text-sm font-medium">Link Bukti (URL)</label>
            <input className="w-full mt-1 p-3 border border-border rounded-xl text-sm bg-background focus:ring-2 focus:ring-ring/20 outline-none" value={updateEvidence} onChange={(e) => setUpdateEvidence(e.target.value)} placeholder="https://..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={() => onSubmit({ status: updateStatus, aoNote: updateNote, evidenceUrl: updateEvidence, submitForApproval: updateStatus === "selesai" })} disabled={isPending}>Kirim</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}