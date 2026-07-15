"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VariantBadge } from "@/components/common";
import { Trash2, User, FileText, Clock } from "lucide-react";

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

function formatDateTime(dateStr: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" }) +
    " " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
}

export function ApprovalHistory({ history, onDeleteOne, onDeleteAll }: ApprovalHistoryProps) {
  if (!history.length) return <p className="text-sm text-muted-foreground">Belum ada riwayat.</p>;

  return (
    <div>
      <div className="flex justify-end mb-3">
        <Button variant="destructive" size="sm" onClick={onDeleteAll}><Trash2 className="w-3.5 h-3.5" /> Hapus Semua</Button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-secondary/50 rounded-xl">
              <th className="p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tugas</th>
              <th className="p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">AO</th>
              <th className="p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Catatan</th>
              <th className="p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Waktu</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {history.map((h) => (
              <tr key={h.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                <td className="p-3"><VariantBadge variant={h.action === "approve" ? "green" : "red"}>{h.action === "approve" ? "Terverifikasi" : "Ditolak"}</VariantBadge></td>
                <td className="p-3 font-medium">{h.task?.name}</td>
                <td className="p-3 whitespace-nowrap">{h.user?.name}</td>
                <td className="p-3 text-muted-foreground max-w-[200px]">
                  {h.note ? <span className="truncate block" title={h.note}>{h.note}</span> : "-"}
                </td>
                <td className="p-3 text-muted-foreground whitespace-nowrap">{formatDateTime(h.createdAt)}</td>
                <td className="p-3"><Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => onDeleteOne(h.id)}><Trash2 className="w-3.5 h-3.5" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {history.map((h) => (
          <Card key={h.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <VariantBadge variant={h.action === "approve" ? "green" : "red"}>{h.action === "approve" ? "Terverifikasi" : "Ditolak"}</VariantBadge>
                </div>
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0" onClick={() => onDeleteOne(h.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
              <p className="font-semibold text-sm flex items-center gap-1.5 mb-1.5">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                {h.task?.name}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-1.5">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {h.user?.name}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDateTime(h.createdAt)}
                </span>
              </div>
              {h.note && (
                <p className="text-xs text-muted-foreground bg-secondary/50 p-2 rounded-lg mt-2 line-clamp-2" title={h.note}>
                  💬 {h.note}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}