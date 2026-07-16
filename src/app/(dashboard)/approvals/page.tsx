"use client";

import { useState, useMemo } from "react";
import { useApprovalList, useApprovalMutations } from "@/hooks/useApprovals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multiselect";
import { Pagination } from "@/components/ui/pagination";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { EmptyState, VariantBadge } from "@/components/common";
import { ApprovalHistory } from "@/components/features/approvals/ApprovalHistory";
import { DeleteConfirmModal } from "@/components/features/users/DeleteConfirmModal";
import { ApprovalsSkeleton } from "@/components/features/approvals/ApprovalsSkeleton";
import { getAOColor } from "@/utils/formatters";
import { FileCheck, Search, Check, X, ExternalLink, Trash2, Folder, Clock, FileText } from "lucide-react";

const PAGE_LIMIT = 10;

export default function ApprovalsPage() {
  const { pending, history, isLoading } = useApprovalList();
  const { approveMutation, rejectMutation, deleteHistoryMutation } = useApprovalMutations();

  const [pendingSearch, setPendingSearch] = useState("");
  const [pendingPrograms, setPendingPrograms] = useState<string[]>([]);
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingLimit, setPendingLimit] = useState(PAGE_LIMIT);

  const [historySearch, setHistorySearch] = useState("");
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLimit, setHistoryLimit] = useState(PAGE_LIMIT);

  const [rejectModal, setRejectModal] = useState<{ taskId: string; userId: string; aoName: string } | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [detailModal, setDetailModal] = useState<{ taskId: string; userId: string; aoName: string; taskName: string; programName: string; programType: string; notes: string; evidenceUrl: string | null; status: string } | null>(null);
  const [deletePending, setDeletePending] = useState<{ taskId: string; userId: string; aoName: string } | null>(null);
  const [deleteHistory, setDeleteHistory] = useState<{ id: string; name: string } | null>(null);
  const [deleteAll, setDeleteAll] = useState(false);

  const progs = useMemo(() => [...new Set(pending.map((p: any) => p.task?.program?.name).filter(Boolean))] as string[], [pending]);
  const progLabels = useMemo(() => new Map(progs.map((p) => [p, p])), [progs]);

  const filteredPending = useMemo(() => {
    let result = pending;
    if (pendingPrograms.length > 0) {
      result = result.filter((p: any) => pendingPrograms.includes(p.task?.program?.name));
    }
    if (pendingSearch) {
      const q = pendingSearch.toLowerCase();
      result = result.filter((p: any) =>
        p.task?.name?.toLowerCase().includes(q) ||
        p.user?.name?.toLowerCase().includes(q) ||
        p.task?.program?.name?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [pending, pendingPrograms, pendingSearch]);

  const byProg: Record<string, any[]> = {};
  filteredPending.forEach((p: any) => {
    const pn = p.task?.program?.name || "-";
    if (!byProg[pn]) byProg[pn] = [];
    const existing = byProg[pn].find((x: any) => x.task.id === p.task?.id);
    if (existing) existing.aos.push(p);
    else byProg[pn].push({ task: p.task || { id: "", name: "" }, program: p.task?.program || { type: "" }, aos: [p] });
  });

  const programEntries = Object.entries(byProg);
  const totalPendingPrograms = programEntries.length;
  const pagedPrograms = programEntries.slice((pendingPage - 1) * pendingLimit, pendingPage * pendingLimit);

  const filteredHistory = useMemo(() => {
    let result = history;
    if (historySearch) {
      const q = historySearch.toLowerCase();
      result = result.filter((h: any) =>
        h.task?.name?.toLowerCase().includes(q) ||
        h.user?.name?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [history, historySearch]);

  const totalHistory = filteredHistory.length;
  const pagedHistory = filteredHistory.slice((historyPage - 1) * historyLimit, historyPage * historyLimit);

  // Stats
  const pendingCount = filteredPending.length;
  const approvedToday = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return history.filter((h: any) => h.action === "approve" && h.createdAt?.startsWith(today)).length;
  }, [history]);
  const rejectedToday = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return history.filter((h: any) => h.action === "reject" && h.createdAt?.startsWith(today)).length;
  }, [history]);

  const handleReject = () => {
    if (!rejectModal) return;
    rejectMutation.mutate({ taskId: rejectModal.taskId, userId: rejectModal.userId, note: rejectNote });
    setRejectModal(null);
    setRejectNote("");
  };

  const handleApprove = (taskId: string, userId: string) => {
    approveMutation.mutate({ taskId, userId });
    setDetailModal(null);
  };

  const handleDeletePending = () => {
    if (!deletePending) return;
    rejectMutation.mutate({ taskId: deletePending.taskId, userId: deletePending.userId, note: "Dihapus oleh PDO." });
    setDeletePending(null);
  };

  if (isLoading) return <ApprovalsSkeleton />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Verifikasi Tugas AO</h1>
        <p className="text-muted-foreground mt-1">Review dan setujui tugas dari AO</p>
      </div>



      {/* ── Menunggu Review ── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <FileCheck className="w-4 h-4 inline mr-1" /> Menunggu Review
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{pendingCount} tugas dari {totalPendingPrograms} program</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="relative w-full sm:w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Cari..."
                value={pendingSearch}
                onChange={(e) => { setPendingSearch(e.target.value); setPendingPage(1); }}
                className="pl-8 h-9 text-sm"
              />
            </div>
            <MultiSelect
              label="Program"
              options={progs}
              optionLabels={progLabels}
              selected={pendingPrograms}
              onChange={(v) => { setPendingPrograms(v); setPendingPage(1); }}
              className="w-full sm:w-[180px]"
            />
          </div>
        </div>

        {/* Pending Cards */}
        {pagedPrograms.length > 0 ? (
          <div className="space-y-4">
            {pagedPrograms.map(([pn, items]) => (
              <Card key={pn} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Program header */}
                  <div className="px-5 py-3 bg-secondary/30 border-b flex items-center gap-2.5">
                    <Folder className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-sm">{pn}</span>
                    <Badge variant="secondary" className="ml-auto text-xs">{items.length} tugas</Badge>
                  </div>
                  <div className="divide-y divide-border">
                    {items.flatMap(({ task, program, aos }) =>
                      aos.map((p: any) => {
                        const aoName = p.user?.name || p.userId;
                        return (
                          <div key={`${task.id}-${p.userId}`} className="p-4 hover:bg-secondary/20 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                              {/* Task info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className="font-semibold text-sm">{task.name}</span>
                                  <VariantBadge variant={program.type === "Akademik" ? "green" : "blue"}>{program.type}</VariantBadge>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                                  <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getAOColor(p.userId) }} />
                                    {aoName}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {p.status || "belum"}
                                  </span>
                                </div>
                                {p.notes && (
                                  <p className="text-xs text-muted-foreground mt-1.5 truncate max-w-[300px]" title={p.notes}>
                                    💬 {p.notes}
                                  </p>
                                )}
                              </div>
                              {/* Actions */}
                              <div className="flex items-center gap-1 shrink-0">
                                {p.task?.evidenceUrl && (
                                  <a href={p.task.evidenceUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="Lihat Bukti">
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-9 px-3 text-green-600 hover:bg-green-50 hover:text-green-700"
                                  onClick={() => setDetailModal({
                                    taskId: task.id, userId: p.userId, aoName,
                                    taskName: task.name, programName: pn, programType: program.type,
                                    notes: p.notes || "", evidenceUrl: p.task?.evidenceUrl || null, status: p.status || "belum",
                                  })}
                                >
                                  <Check className="w-4 h-4 mr-1" /> Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-9 px-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                                  onClick={() => setRejectModal({ taskId: task.id, userId: p.userId, aoName })}
                                >
                                  <X className="w-4 h-4" /> Reject
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState title="Tidak ada yang perlu direview" />
        )}

        {totalPendingPrograms > pendingLimit && (
          <div className="mt-4">
            <Pagination
              page={pendingPage}
              limit={pendingLimit}
              total={totalPendingPrograms}
              onPageChange={setPendingPage}
              onLimitChange={setPendingLimit}
            />
          </div>
        )}
      </div>

      {/* ── Riwayat Verifikasi ── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Riwayat Verifikasi</h3>
          <div className="relative w-full sm:w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Cari..."
              value={historySearch}
              onChange={(e) => { setHistorySearch(e.target.value); setHistoryPage(1); }}
              className="pl-8 h-9 text-sm"
            />
          </div>
        </div>
        <ApprovalHistory
          history={pagedHistory}
          onDeleteOne={(id) => {
            const h = history.find((x: any) => x.id === id);
            setDeleteHistory({ id, name: h?.task?.name || "tugas" });
          }}
          onDeleteAll={() => setDeleteAll(true)}
        />
        {totalHistory > historyLimit && (
          <div className="mt-4">
            <Pagination
              page={historyPage}
              limit={historyLimit}
              total={totalHistory}
              onPageChange={setHistoryPage}
              onLimitChange={setHistoryLimit}
            />
          </div>
        )}
      </div>

      {/* ── Detail/Approve Modal ── */}
      <Dialog open={!!detailModal} onOpenChange={() => setDetailModal(null)}>
        <DialogContent className="sm:min-w-[480px] p-0 overflow-hidden" showCloseButton={false}>
          {/* ── Header ── */}
          <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-6 pt-6 pb-4">
            <button
              onClick={() => setDetailModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-background/60 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/15 shadow-sm ring-1 ring-primary/10">
                <FileCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight">Review Tugas</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Periksa detail sebelum menyetujui</p>
              </div>
            </div>
          </div>

          {/* ── Content ── */}
          <div className="px-6 py-4 space-y-4">
            {/* Info Card */}
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="divide-y divide-border/40">
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 shrink-0">
                    <Folder className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Program</p>
                    <p className="text-sm font-semibold truncate">{detailModal?.programName}</p>
                  </div>
                  <VariantBadge variant={detailModal?.programType === "Akademik" ? "green" : "blue"}>
                    {detailModal?.programType}
                  </VariantBadge>
                </div>

                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 shrink-0">
                    <FileText className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Tugas</p>
                    <p className="text-sm font-semibold truncate">{detailModal?.taskName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0" style={{ backgroundColor: detailModal?.userId ? `${getAOColor(detailModal.userId)}18` : "var(--secondary)" }}>
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: detailModal?.userId ? getAOColor(detailModal.userId) : "var(--border)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">AO</p>
                    <p className="text-sm font-semibold truncate">{detailModal?.aoName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary shrink-0">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Status</p>
                    <Badge variant="secondary" className="text-xs capitalize">{detailModal?.status}</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {detailModal?.notes && (
              <div className="relative rounded-xl border border-amber-200 bg-amber-50/50 overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
                <div className="p-4 pl-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center justify-center w-5 h-5 rounded-md bg-amber-100">
                      <span className="text-[10px]">💬</span>
                    </div>
                    <p className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">Catatan AO</p>
                  </div>
                  <p className="text-sm text-amber-900 leading-relaxed">{detailModal.notes}</p>
                </div>
              </div>
            )}

            {/* Evidence */}
            {detailModal?.evidenceUrl && (
              <a
                href={detailModal.evidenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50/50 p-4 hover:bg-blue-100/60 hover:border-blue-300 transition-all group"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 shrink-0 group-hover:bg-blue-200 transition-colors">
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-blue-700">Lihat Bukti Pengerjaan</p>
                  <p className="text-[11px] text-blue-500 truncate">Klik untuk membuka di tab baru</p>
                </div>
                <ExternalLink className="w-4 h-4 text-blue-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </a>
            )}
          </div>

          {/* ── Footer ── */}
          <DialogFooter className="px-6 py-8 border-t bg-muted/30 gap-3">
            <Button variant="outline" onClick={() => setDetailModal(null)} className="flex-1 sm:flex-none">
              Batal
            </Button>
            <Button
              onClick={() => detailModal && handleApprove(detailModal.taskId, detailModal.userId)}
              disabled={approveMutation.isPending}
              className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 shadow-sm shadow-green-200"
            >
              <Check className="w-4 h-4 mr-1.5" />
              {approveMutation.isPending ? "Memproses..." : "Setujui"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Reject Modal ── */}
      <Dialog open={!!rejectModal} onOpenChange={() => setRejectModal(null)}>
        <DialogContent className="p-0 overflow-hidden" showCloseButton={false}>
          {/* ── Header ── */}
          <div className="relative bg-gradient-to-br from-red-50 via-red-50/50 to-transparent px-6 pt-6 pb-4">
            <button
              onClick={() => setRejectModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-background/60 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-100 shadow-sm ring-1 ring-red-200">
                <X className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight">Tolak Pengajuan</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Dari <span className="font-semibold text-foreground">{rejectModal?.aoName}</span>
                </p>
              </div>
            </div>
          </div>

          {/* ── Content ── */}
          <div className="px-6 py-4">
            <label className="text-sm font-semibold mb-2 block">
              Alasan Penolakan
            </label>
            <textarea
              className="w-full p-3.5 border border-border rounded-xl text-sm bg-background placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-red-500/20 focus:border-red-300 outline-none transition-all resize-none"
              rows={4}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Berikan alasan agar AO bisa memahami dan memperbaiki..."
            />
            <p className="text-[11px] text-muted-foreground mt-2">
              Alasan akan dikirim ke AO sebagai catatan perbaikan.
            </p>
          </div>

          {/* ── Footer ── */}
          <DialogFooter className="px-6 py-8 border-t bg-muted/30 gap-3">
            <Button variant="outline" onClick={() => setRejectModal(null)} className="flex-1 sm:flex-none">
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectMutation.isPending}
              className="flex-1 sm:flex-none shadow-sm shadow-red-200"
            >
              <X className="w-4 h-4 mr-1.5" />
              {rejectMutation.isPending ? "Memproses..." : "Tolak"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Modals ── */}
      <DeleteConfirmModal
        open={!!deletePending}
        username={deletePending?.aoName || ""}
        onClose={() => setDeletePending(null)}
        onConfirm={handleDeletePending}
        isPending={rejectMutation.isPending}
      />
      <DeleteConfirmModal
        open={!!deleteHistory}
        username={deleteHistory?.name || ""}
        onClose={() => setDeleteHistory(null)}
        onConfirm={() => { deleteHistory && deleteHistoryMutation.mutate(deleteHistory.id); setDeleteHistory(null); }}
        isPending={deleteHistoryMutation.isPending}
      />
      <DeleteConfirmModal
        open={deleteAll}
        username="semua riwayat"
        onClose={() => setDeleteAll(false)}
        onConfirm={() => { deleteHistoryMutation.mutate(undefined); setDeleteAll(false); }}
        isPending={deleteHistoryMutation.isPending}
      />
    </div>
  );
}