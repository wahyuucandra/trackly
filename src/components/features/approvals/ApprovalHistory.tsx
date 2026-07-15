"use client";

import { Button } from "@/components/ui/button";
import { VariantBadge } from "@/components/common";
import { formatDate } from "@/utils/formatters";
import { Trash2 } from "lucide-react";

interface HistoryItem {
  id: string;
  action: string;
  task?: { name?: string };
  user?: { name?: string };
  note?: string;
  createdAt: string;
}

interface ApprovalHistoryProps {
  history: HistoryItem[];
  onDeleteOne: (id: string) => void;
  onDeleteAll: () => void;
}

export function ApprovalHistory({ history, onDeleteOne, onDeleteAll }: ApprovalHistoryProps) {
  if (!history.length) return <p className="text-sm text-muted-foreground">Belum ada riwayat.</p>;

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-end mb-2">
        <Button variant="destructive" size="sm" onClick={onDeleteAll}><Trash2 className="w-3.5 h-3.5" /> Hapus Semua</Button>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left bg-secondary/50">
            <th className="p-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
            <th className="p-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tugas</th>
            <th className="p-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">AO</th>
            <th className="p-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Catatan</th>
            <th className="p-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Waktu</th>
            <th className="p-2" />
          </tr>
        </thead>
        <tbody>
          {history.map((h) => (
            <tr key={h.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
              <td className="p-2"><VariantBadge variant={h.action === "approve" ? "green" : "red"}>{h.action === "approve" ? "Terverifikasi" : "Ditolak"}</VariantBadge></td>
              <td className="p-2">{h.task?.name}</td>
              <td className="p-2 whitespace-nowrap">{h.user?.name}</td>
              <td className="p-2 text-muted-foreground max-w-[200px] truncate">{h.note || "-"}</td>
              <td className="p-2 text-muted-foreground">{formatDate(h.createdAt)}</td>
              <td className="p-2"><Button variant="destructive" size="sm" onClick={() => onDeleteOne(h.id)}><Trash2 className="w-3 h-3" /></Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}