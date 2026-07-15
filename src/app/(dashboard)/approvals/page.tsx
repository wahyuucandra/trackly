"use client";

import { useState } from "react";
import { useApprovalList, useApprovalMutations } from "@/hooks/useApprovals";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { EmptyState } from "@/components/common";
import { ApprovalTable } from "@/components/features/approvals/ApprovalTable";
import { ApprovalHistory } from "@/components/features/approvals/ApprovalHistory";
import { FileCheck } from "lucide-react";

export default function ApprovalsPage() {
  const { pending, history } = useApprovalList();
  const { approveMutation, rejectMutation, deleteHistoryMutation } = useApprovalMutations();
  const [filterProg, setFilterProg] = useState("");
  const [filterAO, setFilterAO] = useState("");
  const [rejectModal, setRejectModal] = useState<{ taskId: string; userId: string; aoName: string } | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  const progs = [...new Set(pending.map((p: { task?: { program?: { name?: string } } }) => p.task?.program?.name).filter(Boolean))] as string[];
  const aos = [...new Set(pending.map((p: { userId: string }) => p.userId))] as string[];

  let filteredPending = pending;
  if (filterProg) filteredPending = pending.filter((p: { task?: { program?: { name?: string } } }) => p.task?.program?.name === filterProg);
  if (filterAO) filteredPending = pending.filter((p: { userId: string }) => p.userId === filterAO);

  const byProg: Record<string, { task: { id: string; name: string }; program: { type: string }; aos: string[] }[]> = {};
  filteredPending.forEach((p: { task?: { id: string; name: string; program?: { name: string; type: string } }; userId: string }) => {
    const pn = p.task?.program?.name || "-";
    if (!byProg[pn]) byProg[pn] = [];
    const existing = byProg[pn].find((x) => x.task.id === p.task?.id);
    if (existing) existing.aos.push(p.userId);
    else byProg[pn].push({ task: p.task || { id: "", name: "" }, program: p.task?.program || { type: "" }, aos: [p.userId] });
  });

  let filteredHistory = history;
  if (filterProg) filteredHistory = history.filter((h: { task?: { name?: string } }) => h.task?.name === filterProg);
  if (filterAO) filteredHistory = history.filter((h: { userId: string }) => h.userId === filterAO);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Verifikasi Tugas AO</h1>
        <p className="text-muted-foreground text-sm">Review dan setujui tugas dari AO</p>
      </div>

      <div className="flex gap-2.5 flex-wrap">
        <Select value={filterProg} onValueChange={(v) => setFilterProg(v ?? "")}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Semua Program" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Semua Program</SelectItem>
            {progs.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterAO} onValueChange={(v) => setFilterAO(v ?? "")}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Semua AO" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Semua AO</SelectItem>
            {aos.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          <FileCheck className="w-4 h-4 inline mr-1" /> Menunggu Review ({filteredPending.length})
        </h3>
        {Object.entries(byProg).map(([pn, items]) => (
          <ApprovalTable
            key={pn}
            programName={pn}
            items={items}
            pending={pending}
            onApprove={(taskId, userId) => approveMutation.mutate({ taskId, userId })}
            onReject={(taskId, userId, aoName) => setRejectModal({ taskId, userId, aoName })}
          />
        ))}
        {!Object.keys(byProg).length && <EmptyState title="Tidak ada yang perlu direview" />}
      </div>

      <hr className="border-border" />

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Riwayat Verifikasi</h3>
        <ApprovalHistory
          history={filteredHistory}
          onDeleteOne={(id) => deleteHistoryMutation.mutate(id)}
          onDeleteAll={() => deleteHistoryMutation.mutate(undefined)}
        />
      </div>

      <Dialog open={!!rejectModal} onOpenChange={() => setRejectModal(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tolak Update — {rejectModal?.aoName}</DialogTitle></DialogHeader>
          <div>
            <label className="text-sm font-medium">Alasan penolakan</label>
            <textarea className="w-full mt-1 p-3 border border-border rounded-xl text-sm bg-background focus:ring-2 focus:ring-ring/20 outline-none" rows={3} value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} placeholder="Berikan alasan agar AO bisa memperbaiki" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModal(null)}>Batal</Button>
            <Button variant="destructive" onClick={() => rejectModal && rejectMutation.mutate({ taskId: rejectModal.taskId, userId: rejectModal.userId, note: rejectNote })} disabled={rejectMutation.isPending}>
              Tolak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}