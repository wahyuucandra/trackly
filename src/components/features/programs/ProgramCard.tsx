"use client";

import { useState, useRef, useEffect } from "react";
import { StatusBadge, VariantBadge } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getAOColor } from "@/utils/formatters";
import { Folder, MapPin, Users, ExternalLink, Trash2, Plus, ChevronDown, ChevronUp, MoreVertical, Edit, Clock, StickyNote, AlertTriangle } from "lucide-react";
import type { Program, Task, TaskPIC } from "@/types";

interface ProgramCardProps {
  program: Program;
  progress: number;
  areaMap: Map<string, string>;
  onAddTask: (id: string) => void;
  onEdit: (prog: Program) => void;
  onDelete: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onShowHistory: (task: Task) => void;
}

// ─── Helpers ─────────────────────────────────────────────────

const TruncatedList = ({ items, empty = "-" }: { items: string[]; empty?: string }) => {
  if (!items.length) return <span className="text-muted-foreground/60 italic">{empty}</span>;
  const shown = items.slice(0, 2);
  const rest = items.length - 2;
  return (
    <span title={items.join(", ")}>
      {shown.join(", ")}
      {rest > 0 && <span className="text-muted-foreground/60 ml-0.5">+{rest}</span>}
    </span>
  );
};

const AOPicList = ({ pics, aoList }: { pics: TaskPIC[]; aoList: Program["aos"] }) => {
  if (!pics.length) return null;
  const names = pics.map((p) => {
    const ao = aoList.find((a) => a.userId === p.userId);
    return ao?.user?.name || p.userId;
  });
  const shown = names.slice(0, 2);
  const rest = names.length - 2;
  return (
    <span className="text-[11px] text-muted-foreground flex items-center gap-1" title={names.join(", ")}>
      <Users className="w-3 h-3" />
      {shown.join(", ")}
      {rest > 0 && <span className="text-muted-foreground/60">+{rest}</span>}
    </span>
  );
};

const TaskDeadline = ({ deadline }: { deadline: string }) => {
  if (!deadline) return null;
  const dueDate = new Date(deadline + "T23:59:59+07:00");
  const diff = dueDate.getTime() - Date.now();
  const absDiff = Math.abs(diff);
  const days = Math.floor(absDiff / 86400000);
  const hours = Math.floor((absDiff % 86400000) / 3600000);

  const dateStr = new Date(deadline + "T00:00:00+07:00").toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });

  if (diff < 0) {
    return <span className="text-xs text-muted-foreground w-full">{dateStr} · <span className="font-semibold text-red-600">Lewat {days > 0 ? `${days} hari` : `${hours} jam`}</span></span>;
  }
  if (days > 0) {
    return <span className="text-xs text-muted-foreground w-full">{dateStr} · <span className="font-semibold text-amber-600">{days} hari lagi</span></span>;
  }
  return <span className="text-xs text-muted-foreground w-full">{dateStr} · <span className="font-semibold text-red-600">{hours} jam lagi</span></span>;
};

// ─── Main Component ──────────────────────────────────────────

const ActionMenu = ({ onAddTask, onEdit, onDelete }: { onAddTask: () => void; onEdit: () => void; onDelete: () => void }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setOpen(!open)}>
        <MoreVertical className="w-4 h-4" />
      </Button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-44 bg-popover border border-border rounded-lg shadow-lg p-1.5">
          <button onClick={() => { onAddTask(); setOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors">
            <Plus className="w-3.5 h-3.5" /> Tambah Tugas
          </button>
          <button onClick={() => { onEdit(); setOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors">
            <Edit className="w-3.5 h-3.5" /> Edit Program
          </button>
          <button onClick={() => { onDelete(); setOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-red-50 text-red-600 transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Hapus Program
          </button>
        </div>
      )}
    </div>
  );
};

export function ProgramCard({ program, progress, areaMap, onAddTask, onEdit, onDelete, onEditTask, onDeleteTask, onShowHistory }: ProgramCardProps) {
  const [expanded, setExpanded] = useState(false);
  const tasks = program.tasks || [];
  const jadwal = program.jadwal || [];
  const areas = [...new Set(jadwal.map((j) => areaMap.get(j.area) || j.area))];
  const aoList = program.aos || [];

  // AO names for tooltip
  const aoNames = aoList.map((a) => a.user?.name || a.userId);

  return (
    <div className="bg-card rounded-[20px] border border-border p-5 md:p-6 shadow-[0_4px_16px_rgba(15,23,42,.04)]">
      {/* Head */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-base font-bold flex items-center gap-2">
          <Folder className="w-4 h-4 text-primary shrink-0" />
          <span className="truncate">{program.name}</span>
        </h3>
        <ActionMenu
          onAddTask={() => onAddTask(program.id)}
          onEdit={() => onEdit(program)}
          onDelete={() => onDelete(program.id)}
        />
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[13px] text-muted-foreground mb-2">
        <VariantBadge variant={program.type === "Akademik" ? "green" : "blue"}>{program.type}</VariantBadge>
        <span className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          <TruncatedList items={areas} />
        </span>
        {aoNames.length > 0 && (
          <span className="flex items-center gap-1.5" title={aoNames.join(", ")}>
            <Users className="w-3.5 h-3.5" />
            <TruncatedList items={aoNames} />
          </span>
        )}
      </div>

      {/* Notes */}
      {program.notes && (
        <p className="text-[13px] text-muted-foreground mb-2.5 flex items-start gap-1.5">
          <ExternalLink className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-40" />
          {program.notes}
        </p>
      )}

      {/* Progress */}
      <div className="mb-2">
        <Progress value={progress} className="h-[10px] rounded-full" />
        <span className="text-xs text-muted-foreground block text-right mt-0.5">
          {progress}% selesai · {tasks.length} tugas
        </span>
      </div>

      {/* Tasks — expand/collapse */}
      {tasks.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[13px] font-semibold text-muted-foreground">Daftar Tugas ({tasks.length})</p>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {expanded ? "Sembunyikan" : "Lihat Semua"}
            </button>
          </div>

          {expanded && (
            <div className="space-y-2.5">
              {tasks.map((task) => {
                const firstAO = task.pics?.[0]?.userId;
                const isApproved = (task.statuses || []).some((s) => s.isApproved);
                const taskPics = task.pics?.length ? task.pics : aoList;
                const hasHistory = (task.statuses || []).length > 0 || (task.approvals || []).length > 0 || (task.statusHistory || []).length > 0;
                return (
                  <div
                    key={task.id}
                    className="bg-background p-3.5 pl-4 rounded-xl border border-border"
                    style={{ borderLeft: `4px solid ${firstAO ? getAOColor(firstAO) : "var(--border)"}` }}
                  >
                    {/* Task header */}
                    <div className="flex justify-between gap-2 mb-1">
                      <span className="text-sm font-semibold">{task.name}</span>
                      <StatusBadge status={isApproved ? "selesai" : (task.statuses || []).some((s) => s.status === "berjalan") ? "berjalan" : "belum"} isApproved={isApproved} />
                    </div>

                    {/* PICs — above notes */}
                    <AOPicList pics={taskPics} aoList={aoList} />

                    {/* Admin notes */}
                    {task.notes && (
                      <div className="bg-white border border-border rounded-xl p-3 mt-2 mb-2">
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <StickyNote className="w-3 h-3" />
                          Catatan
                        </p>
                        <div className="flex items-start gap-2">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shrink-0 mt-0.5">A</span>
                          <div>
                            <span className="text-xs font-semibold text-primary">Admin</span>
                            <p className="text-sm text-foreground/80 leading-relaxed mt-0.5">{task.notes}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bottom row: due date + actions */}
                    <div className="flex justify-between items-center gap-2 mt-1">
                      <TaskDeadline deadline={task.deadline} />
                      <div className="flex items-center gap-1 shrink-0">
                        {hasHistory && (
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-muted-foreground" onClick={() => onShowHistory(task)} title="Riwayat">
                            <Clock className="w-3 h-3" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-muted-foreground" onClick={() => onEditTask(task)} title="Edit">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-red-500" onClick={() => onDeleteTask(task.id)} title="Hapus">
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
      )}

      {tasks.length === 0 && (
        <div className="mt-3 pt-3 border-t border-border text-[13px] text-muted-foreground italic flex items-center gap-1.5">
          <Folder className="w-3.5 h-3.5 opacity-40" />
          Belum ada tugas. Klik ⋮ &gt; Tambah Tugas untuk menambahkan.
        </div>
      )}
    </div>
  );
}