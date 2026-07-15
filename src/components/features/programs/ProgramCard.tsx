"use client";

import { StatusBadge, DeadlineBadge, VariantBadge } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getAOColor } from "@/utils/formatters";
import { Folder, MapPin, Users, StickyNote, ExternalLink, Edit, Trash2, Plus } from "lucide-react";
import type { Program } from "@/types";

interface ProgramCardProps {
  program: Program;
  progress: number;
  areaMap: Map<string, string>;
  onAddTask: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export function ProgramCard({ program, progress, areaMap, onAddTask, onEdit, onDelete, onDeleteTask }: ProgramCardProps) {
  const tasks = program.tasks || [];

  return (
    <div className="border border-border rounded-xl bg-card shadow-sm">
      <div className="p-5 md:p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-base font-bold flex items-center gap-2">
            <Folder className="w-4 h-4 text-muted-foreground" />
            {program.name}
          </h3>
          <div className="flex gap-1.5 shrink-0">
            <Button size="sm" variant="outline" onClick={() => onAddTask(program.id)}>
              <Plus className="w-3 h-3" /> Tugas
            </Button>
            <Button size="sm" variant="outline" onClick={() => onEdit(program.id)}>
              <Edit className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="destructive" onClick={() => { if (confirm("Hapus program ini?")) onDelete(program.id); }}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
          <VariantBadge variant={program.type === "Akademik" ? "green" : "blue"}>{program.type}</VariantBadge>
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{[...new Set((program.jadwal || []).map((j) => areaMap.get(j.area) || j.area))].join(", ")}</span>
          {(program.aos || []).length > 0 && (
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{(program.aos || []).map((a) => a.user?.name || a.userId).join(", ")}</span>
          )}
        </div>

        {program.notes && (
          <p className="text-sm text-muted-foreground mb-3 flex items-start gap-1.5">
            <StickyNote className="w-3.5 h-3.5 mt-0.5 shrink-0" />{program.notes}
          </p>
        )}

        <div className="mb-3">
          <Progress value={progress} className="h-2" />
          <span className="text-sm text-muted-foreground block text-right mt-0.5">{progress}% selesai · {tasks.length} tugas</span>
        </div>

        {tasks.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-sm font-semibold text-muted-foreground mb-2">Daftar Tugas ({tasks.length})</p>
            {tasks.map((task) => {
              const firstAO = task.pics?.[0]?.userId;
              const status = (task.statuses || []).find((s) => s.userId === firstAO);
              const isApproved = (task.statuses || []).some((s) => s.isApproved);
              return (
                <div key={task.id} className="bg-background p-3 rounded-lg border border-border mb-2" style={{ borderLeft: `3px solid ${firstAO ? getAOColor(firstAO) : "var(--border)"}` }}>
                  <div className="flex justify-between gap-2 mb-1">
                    <span className="text-sm font-semibold">{task.name}</span>
                    <StatusBadge status={status?.status || "belum"} isApproved={isApproved} />
                  </div>
                  <div className="flex justify-between flex-wrap gap-2 items-center">
                    <div className="flex items-center gap-2">
                      <DeadlineBadge deadline={task.deadline} />
                      {task.evidenceUrl && (
                        <a href={task.evidenceUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 flex items-center gap-1 hover:underline">
                          <ExternalLink className="w-3 h-3" /> Bukti
                        </a>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost"><Edit className="w-3 h-3" /></Button>
                      <Button size="sm" variant="ghost" className="text-red-500" onClick={() => { if (confirm("Hapus tugas ini?")) onDeleteTask(task.id); }}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}