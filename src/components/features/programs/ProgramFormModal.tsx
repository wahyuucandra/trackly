"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multiselect";
import { Folder, Plus, Trash2, Search } from "lucide-react";
import type { Program } from "@/types";

interface JadwalEntry {
  area: string;
  startDate: string;
  endDate: string;
}

interface ProgramFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editProgram: Program | null;
  formData: { name: string; type: string; notes: string };
  setFormData: React.Dispatch<React.SetStateAction<{ name: string; type: string; notes: string }>>;
  jadwal: JadwalEntry[];
  updateJadwal: (idx: number, field: keyof JadwalEntry, value: string) => void;
  addJadwal: () => void;
  removeJadwal: (idx: number) => void;
  aoIds: string[];
  setAoIds: React.Dispatch<React.SetStateAction<string[]>>;
  allAreas: string[];
  areaMap: Map<string, string>;
  aoUsers: { id: string; name: string; area?: string[] }[];
  onSave: () => void;
  isPending: boolean;
}

export function ProgramFormModal({
  open,
  onOpenChange,
  editProgram,
  formData,
  setFormData,
  jadwal,
  updateJadwal,
  addJadwal,
  removeJadwal,
  aoIds,
  setAoIds,
  allAreas,
  areaMap,
  aoUsers,
  onSave,
  isPending,
}: ProgramFormModalProps) {
  // Filter AO by selected areas
  const selectedAreas = useMemo(() => jadwal.map((j) => j.area).filter(Boolean), [jadwal]);

  const filteredAOUsers = useMemo(() => {
    if (!selectedAreas.length) return aoUsers;
    return aoUsers.filter((u) =>
      (u.area || []).some((a) => selectedAreas.includes(a)),
    );
  }, [aoUsers, selectedAreas]);

  const aoOptions = filteredAOUsers.map((u) => u.id);
  const aoLabelMap = new Map(filteredAOUsers.map((u) => [u.id, u.name]));

  const aoLabel = aoIds.length === 0
    ? "Pilih AO"
    : aoIds.length === 1
      ? (aoLabelMap.get(aoIds[0]) || aoIds[0])
      : `${aoIds.length} AO`;

  // Search state for area selects (keyed by row index)
  const [areaSearches, setAreaSearches] = useState<Record<number, string>>({});

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:min-w-[600px] p-0 gap-0 overflow-visible">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border bg-secondary/30">
          <DialogTitle className="text-lg flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10">
              <Folder className="w-5 h-5 text-primary" />
            </div>
            {editProgram ? "Edit Program" : "Buat Program Baru"}
          </DialogTitle>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          {/* Nama */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nama Program</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nama program"
              className="mt-1.5"
            />
          </div>

          {/* Jenis — w-full */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Jenis</label>
            <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as string })}>
              <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Program Development">Program Development</SelectItem>
                <SelectItem value="Akademik">Akademik</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Catatan */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Catatan (opsional)</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Catatan program..."
              className="mt-1.5"
              rows={3}
            />
          </div>

          {/* Jadwal (Area + Rentang Tanggal) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Jadwal per Area</label>
              <Button type="button" variant="ghost" size="sm" onClick={addJadwal} className="h-7 text-xs gap-1">
                <Plus className="w-3 h-3" /> Tambah Area
              </Button>
            </div>
            <div className="space-y-3">
              {jadwal.map((j, idx) => {
                const areaSearch = areaSearches[idx] || "";
                const filteredAreas = areaSearch
                  ? allAreas.filter((a) => (areaMap.get(a) || a).toLowerCase().includes(areaSearch.toLowerCase()))
                  : allAreas;
                return (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end border border-border rounded-lg p-3 bg-secondary/10">
                    <div className="relative">
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Area</label>
                      <Select value={j.area} onValueChange={(v) => updateJadwal(idx, "area", v as any)}>
                        <SelectTrigger className="mt-1 h-9 text-sm">
                        {j.area ? <span>{areaMap.get(j.area) || j.area}</span> : <span className="text-muted-foreground">Pilih area</span>}
                      </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          <div className="sticky top-0 bg-popover p-2 border-b z-10">
                            <div className="relative">
                              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                              <Input
                                placeholder="Cari area..."
                                value={areaSearch}
                                onChange={(e) => setAreaSearches((prev) => ({ ...prev, [idx]: e.target.value }))}
                                className="pl-7 h-7 text-xs"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                          {filteredAreas.map((a) => (
                            <SelectItem key={a} value={a}>{areaMap.get(a) || a}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Mulai</label>
                      <Input type="date" value={j.startDate} onChange={(e) => updateJadwal(idx, "startDate", e.target.value)} className="mt-1 h-9 text-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Selesai</label>
                      <Input type="date" value={j.endDate} onChange={(e) => updateJadwal(idx, "endDate", e.target.value)} className="mt-1 h-9 text-sm" />
                    </div>
                    <div className="flex items-end">
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeJadwal(idx)} disabled={jadwal.length <= 1} className="h-9 w-9 text-muted-foreground hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AO — filtered by area */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AO (opsional)</label>
            {selectedAreas.length === 0 && (
              <p className="text-[11px] text-muted-foreground mt-1">Pilih area terlebih dahulu untuk filter AO.</p>
            )}
            <div className="border border-border rounded-md p-3 mt-1.5 min-h-[42px]">
              <MultiSelect
                label={aoLabel}
                options={aoOptions}
                optionLabels={aoLabelMap}
                selected={aoIds}
                onChange={setAoIds}
                placeholder="Cari AO..."
              />
              {aoIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {aoIds.slice(0, 2).map((id) => (
                    <span key={id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                      {aoLabelMap.get(id) || id}
                      <button
                        onClick={() => setAoIds((prev) => prev.filter((x) => x !== id))}
                        className="ml-0.5 hover:text-red-500 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {aoIds.length > 2 && (
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium cursor-default"
                      title={aoIds.map((id) => aoLabelMap.get(id) || id).join(", ")}
                    >
                      +{aoIds.length - 2} lainnya
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-secondary/20 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="px-5">Batal</Button>
          <Button onClick={onSave} disabled={isPending} className="px-5">
            {editProgram ? "Simpan Perubahan" : "Buat Program"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}