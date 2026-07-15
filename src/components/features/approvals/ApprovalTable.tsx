"use client";

import { Button } from "@/components/ui/button";
import { VariantBadge } from "@/components/common";
import { getAOColor } from "@/utils/formatters";
import { Check, X, ExternalLink, Folder, Trash2 } from "lucide-react";

interface PendingItem {
  taskId: string;
  userId: string;
  notes?: string;
  status?: string;
  evidenceUrl?: string;
  user?: { id: string; name: string };
}

interface ApprovalTableProps {
  programName: string;
  items: { task: { id: string; name: string }; program: { type: string }; aos: PendingItem[] }[];
  areaMap: Map<string, string>;
  onApprove: (taskId: string, userId: string, aoName: string, taskName: string, pgName: string, notes: string, evidenceUrl: string | null, status: string) => void;
  onReject: (taskId: string, userId: string, aoName: string) => void;
  onDelete: (taskId: string, userId: string, aoName: string) => void;
}

export function ApprovalTable({ programName, items, areaMap, onApprove, onReject, onDelete }: ApprovalTableProps) {
  return (
    <div className="mb-5">
      <p className="font-bold text-sm mb-2 text-muted-foreground"><Folder className="w-4 h-4 inline mr-1" /> {programName}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-secondary/50 rounded-xl">
              <th className="p-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Program</th>
              <th className="p-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Jenis</th>
              <th className="p-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tugas</th>
              <th className="p-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">AO</th>
              <th className="p-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Catatan</th>
              <th className="p-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="p-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.flatMap(({ task, program, aos }) =>
              aos.map((p, i) => {
                const aoName = p.user?.name || p.userId;
                return (
                  <tr key={`${task.id}-${p.userId}`} className="border-b border-border hover:bg-secondary/30 transition-colors">
                    <td className="p-2.5">
                      {i === 0 && <span className="font-semibold">{programName}</span>}
                    </td>
                    <td className="p-2.5">
                      {i === 0 && <VariantBadge variant={program.type === "Akademik" ? "green" : "blue"}>{program.type}</VariantBadge>}
                    </td>
                    <td className="p-2.5">
                      {i === 0 && <span className="font-semibold">{task.name}</span>}
                    </td>
                    <td className="p-2.5 whitespace-nowrap">
                      <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ background: getAOColor(p.userId) }} />
                      <span className="font-semibold">{aoName}</span>
                    </td>
                    <td className="p-2.5 text-muted-foreground max-w-[150px]">
                      {p.notes ? (
                        <span className="truncate block" title={p.notes}>{p.notes}</span>
                      ) : "-"}
                    </td>
                    <td className="p-2.5">{p.status || "belum"}</td>
                    <td className="p-2.5 text-center whitespace-nowrap">
                      {p.evidenceUrl && <a href={p.evidenceUrl} target="_blank" className="text-blue-600 mr-1.5"><ExternalLink className="w-3.5 h-3.5 inline" /></a>}
                      <Button size="sm" variant="ghost" className="text-green-600" onClick={() => onApprove(task.id, p.userId, aoName, task.name, programName, p.notes || "", p.evidenceUrl || null, p.status || "belum")}><Check className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="text-red-600" onClick={() => onReject(task.id, p.userId, aoName)}><X className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="text-red-500" onClick={() => onDelete(task.id, p.userId, aoName)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}