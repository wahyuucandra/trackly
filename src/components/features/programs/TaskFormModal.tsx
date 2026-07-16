"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { MultiSelect } from "@/components/ui/multiselect";
import { ListPlus, Edit, X } from "lucide-react";
import type { Task } from "@/types";

interface TaskFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programId: string;
  editTask: Task | null;
  aoUsers: { id: string; name: string }[];
  onSave: (data: { programId: string; name: string; deadline: string; notes: string; picIds: string[] }) => void;
  isPending: boolean;
}

export function TaskFormModal({ open, onOpenChange, programId, editTask, aoUsers, onSave, isPending }: TaskFormModalProps) {
  const [name, setName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [notes, setNotes] = useState("");
  const [picIds, setPicIds] = useState<string[]>([]);

  const isEdit = !!editTask;

  useEffect(() => {
    if (editTask) {
      setName(editTask.name);
      setDeadline(editTask.deadline);
      setNotes(editTask.notes || "");
      setPicIds((editTask.pics || []).map((p) => p.userId));
    } else {
      setName("");
      setDeadline("");
      setNotes("");
      setPicIds([]);
    }
  }, [editTask, open]);

  const aoOptions = aoUsers.map((u) => u.id);
  const aoLabelMap = new Map(aoUsers.map((u) => [u.id, u.name]));

  const isValid = name.trim() !== "" && deadline !== "" && picIds.length > 0;

  const handleSave = () => {
    if (!isValid) return;
    onSave({ programId: editTask?.programId || programId, name, deadline, notes, picIds });
  };

  const picLabel = picIds.length === 0
    ? "Pilih PIC"
    : picIds.length === 1
      ? (aoLabelMap.get(picIds[0]) || picIds[0])
      : `${picIds.length} PIC`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:min-w-[500px] p-0 gap-0 max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-border bg-secondary/30 flex items-center justify-between shrink-0">
          <DialogTitle className="text-lg flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10">
              {isEdit ? <Edit className="w-5 h-5 text-primary" /> : <ListPlus className="w-5 h-5 text-primary" />}
            </div>
            {isEdit ? "Edit Tugas" : "Tambah Tugas"}
          </DialogTitle>
          <DialogClose
            render={
              <Button variant="ghost" size="icon-sm" className="h-8 w-8" />
            }
          >
            <X className="w-4 h-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Nama Tugas <span className="text-red-500">*</span>
              </label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama tugas" className="mt-1.5" required />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Deadline <span className="text-red-500">*</span>
              </label>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="mt-1.5" required />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              PIC <span className="text-red-500">*</span>
            </label>
            <div className="mt-1.5">
              <MultiSelect
                label={picLabel}
                options={aoOptions}
                optionLabels={aoLabelMap}
                selected={picIds}
                onChange={setPicIds}
                placeholder="Cari AO..."
                inline
              />
              {picIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {picIds.slice(0, 3).map((id) => (
                    <span key={id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                      {aoLabelMap.get(id) || id}
                      <button
                        onClick={() => setPicIds((prev) => prev.filter((x) => x !== id))}
                        className="ml-0.5 hover:text-red-500 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {picIds.length > 3 && (
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium cursor-default"
                      title={picIds.map((id) => aoLabelMap.get(id) || id).join(", ")}
                    >
                      +{picIds.length - 3} lainnya
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Catatan (opsional)
            </label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Instruksi atau catatan" className="mt-1.5" rows={5} />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border bg-secondary/20 flex items-center justify-end gap-3 shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="px-5">Batal</Button>
          <Button onClick={handleSave} disabled={isPending || !isValid} className="px-5">
            Simpan Tugas
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}