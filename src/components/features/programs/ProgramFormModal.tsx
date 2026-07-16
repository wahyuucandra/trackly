"use client";

import { useMemo, useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SelectInline } from "@/components/ui/select-inline";
import { MultiSelect } from "@/components/ui/multiselect";
import { Folder, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
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
  setJadwal: React.Dispatch<React.SetStateAction<JadwalEntry[]>>;
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
  setJadwal,
  aoIds,
  setAoIds,
  allAreas,
  areaMap,
  aoUsers,
  onSave,
  isPending,
}: ProgramFormModalProps) {
  // ─── Selected areas ────────────────────────────────────────
  const selectedAreas = useMemo(
    () => jadwal.map((j) => j.area).filter(Boolean),
    [jadwal],
  );

  // ─── Filter AO by selected areas ───────────────────────────
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

  // ─── AO disable: butuh isi tanggal dulu ────────────────────
  const hasDates = jadwal.some((j) => j.area && j.startDate && j.endDate);

  // ─── Area options filtered by AO ───────────────────────────
  const areaOptionsByAO = useMemo(() => {
    if (aoIds.length === 0) return allAreas;
    const aoAreaSet = new Set<string>();
    aoUsers
      .filter((u) => aoIds.includes(u.id))
      .forEach((u) => (u.area || []).forEach((a) => aoAreaSet.add(a)));
    if (aoAreaSet.size === 0) return allAreas;
    return allAreas.filter((a) => aoAreaSet.has(a));
  }, [allAreas, aoIds, aoUsers]);

  // ─── Group jadwal by (startDate, endDate) ──────────────────
  const dateGroups = useMemo(() => {
    const seen = new Set<string>();
    const groups: { key: string; startDate: string; endDate: string; areas: string[] }[] = [];
    for (const j of jadwal) {
      const key = `${j.startDate}||${j.endDate}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const blockAreas = jadwal
        .filter((x) => x.startDate === j.startDate && x.endDate === j.endDate)
        .map((x) => x.area)
        .filter(Boolean);
      groups.push({ key, startDate: j.startDate, endDate: j.endDate, areas: blockAreas });
    }
    return groups;
  }, [jadwal]);

  const addBlock = useCallback(() => {
    const ts = Date.now().toString();
    setJadwal((prev) => [
      ...prev,
      { area: "", startDate: `__new_${ts}`, endDate: `__new_${ts}` },
    ]);
  }, [setJadwal]);

  const canAddBlock = dateGroups.length < 3;

  // ─── Toggle Sama / Beda ──────────────────────────────────
  const [isSameDate, setIsSameDate] = useState(false);

  // ─── Validation ────────────────────────────────────────────
  const hasAreaFilled = jadwal.some((j) => j.area);
  const hasAllDates = jadwal
    .filter((j) => j.area)
    .every((j) => j.startDate && j.endDate);
  const isValid =
    formData.name.trim() !== "" &&
    formData.type !== "" &&
    hasAreaFilled &&
    hasAllDates &&
    aoIds.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:min-w-[650px] sm:max-w-[650px] p-0 gap-0 max-h-[90vh] flex flex-col">
        {/* Header — close button di dalam */}
        <div className="px-6 py-4 border-b border-border bg-secondary/30 flex items-center justify-between shrink-0">
          <DialogTitle className="text-lg flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10">
              <Folder className="w-5 h-5 text-primary" />
            </div>
            {editProgram ? "Edit Program" : "Buat Program Baru"}
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

        {/* Content (scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Nama — mandatory */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Nama Program <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nama program"
              className="mt-1.5"
              required
            />
          </div>

          {/* Jenis — mandatory */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Jenis <span className="text-red-500">*</span>
            </label>
            <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as string })}>
              <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Program Development">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    Program Development
                  </span>
                </SelectItem>
                <SelectItem value="Akademik">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    Akademik
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ─── Jadwal — Mode Toggle ─────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Jadwal per Area <span className="text-red-500">*</span>
              </label>
              <div className="flex border border-border rounded-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    if (!isSameDate) {
                      // Beda → Sama: merge all areas, use first block's dates
                      const first = dateGroups[0];
                      const allAreas = dateGroups.flatMap((g) => g.areas).filter(Boolean);
                      const start = first?.startDate?.startsWith("__new_") ? "" : (first?.startDate || "");
                      const end = first?.endDate?.startsWith("__new_") ? "" : (first?.endDate || "");
                      setJadwal(
                        allAreas.length > 0
                          ? allAreas.map((a) => ({ area: a, startDate: start, endDate: end }))
                          : [{ area: "", startDate: start, endDate: end }],
                      );
                    }
                    setIsSameDate(true);
                  }}
                  className={cn(
                    "px-3 py-1 text-xs font-medium transition-colors",
                    isSameDate
                      ? "bg-primary text-primary-foreground"
                      : "bg-transparent text-muted-foreground hover:bg-secondary",
                  )}
                >
                  Sama
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (isSameDate) {
                      // Sama → Beda: buat blok per area
                      const areas = dateGroups[0]?.areas || [];
                      const start = dateGroups[0]?.startDate?.startsWith("__new_") ? "" : (dateGroups[0]?.startDate || "");
                      const end = dateGroups[0]?.endDate?.startsWith("__new_") ? "" : (dateGroups[0]?.endDate || "");
                      if (areas.length > 0) {
                        // Each area gets its own block with unique timestamp
                        setJadwal(
                          areas.map((a, i) => ({
                            area: a,
                            startDate: start || `__new_${Date.now() + i}`,
                            endDate: end || `__new_${Date.now() + i}`,
                          })),
                        );
                      } else {
                        setJadwal([{ area: "", startDate: start, endDate: end }]);
                      }
                    }
                    setIsSameDate(false);
                  }}
                  className={cn(
                    "px-3 py-1 text-xs font-medium transition-colors",
                    !isSameDate
                      ? "bg-primary text-primary-foreground"
                      : "bg-transparent text-muted-foreground hover:bg-secondary",
                  )}
                >
                  Beda per Area
                </button>
              </div>
            </div>

            {/* ─── Mode "Sama" ─────────────────────────────────── */}
            {isSameDate && (
              <div className="space-y-3 border border-border rounded-lg p-4 bg-secondary/5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Mulai <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={dateGroups[0]?.startDate?.startsWith("__new_") ? "" : (dateGroups[0]?.startDate || "")}
                      onChange={(e) => {
                        const v = e.target.value;
                        setJadwal((prev) => prev.map((j) => ({ ...j, startDate: v })));
                      }}
                      className="mt-1 h-9 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Selesai <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={dateGroups[0]?.endDate?.startsWith("__new_") ? "" : (dateGroups[0]?.endDate || "")}
                      onChange={(e) => {
                        const v = e.target.value;
                        setJadwal((prev) => prev.map((j) => ({ ...j, endDate: v })));
                      }}
                      className="mt-1 h-9 text-sm"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Area <span className="text-red-500">*</span>
                  </label>
                  <MultiSelect
                    label={dateGroups[0]?.areas.length === 0 ? "Pilih Area" : dateGroups[0]?.areas.length === 1 ? (areaMap.get(dateGroups[0].areas[0]) || dateGroups[0].areas[0]) : `${dateGroups[0]?.areas.length || 0} area`}
                    options={areaOptionsByAO}
                    optionLabels={areaMap}
                    selected={dateGroups[0]?.areas || []}
                    onChange={(areas) => {
                      const start = dateGroups[0]?.startDate || "";
                      const end = dateGroups[0]?.endDate || "";
                      setJadwal(
                        areas.length > 0
                          ? areas.map((a) => ({ area: a, startDate: start, endDate: end }))
                          : [{ area: "", startDate: start, endDate: end }],
                      );
                    }}
                    placeholder="Cari area..."
                    inline
                  />
                  {(dateGroups[0]?.areas || []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {dateGroups[0].areas.map((area) => (
                        <span key={area} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                          {areaMap.get(area) || area}
                          <button
                            type="button"
                            onClick={() => {
                              const newAreas = dateGroups[0].areas.filter((a) => a !== area);
                              const start = dateGroups[0]?.startDate || "";
                              const end = dateGroups[0]?.endDate || "";
                              setJadwal(
                                newAreas.length > 0
                                  ? newAreas.map((a) => ({ area: a, startDate: start, endDate: end }))
                                  : [{ area: "", startDate: start, endDate: end }],
                              );
                            }}
                            className="ml-0.5 hover:text-red-500 transition-colors"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── Mode "Beda per Area" — 1 baris ────────────── */}
            {!isSameDate && (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {dateGroups.map((group, gi) => {
                  // Area yang sudah dipakai di baris lain
                  const usedInOtherRows = new Set<string>();
                  dateGroups.forEach((g, i) => {
                    if (i !== gi && g.areas[0]) usedInOtherRows.add(g.areas[0]);
                  });
                  const availableAreas = areaOptionsByAO.filter(
                    (a) => !usedInOtherRows.has(a) || a === group.areas[0],
                  );

                  return (
                  <div key={group.key} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end border border-border rounded-lg p-3 bg-secondary/10">
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Area <span className="text-red-500">*</span>
                      </label>
                      <Select value={group.areas[0] || ""} onValueChange={(area) => {
                        if (!area) return;
                        setJadwal((prev) => {
                          const others = prev.filter(
                            (x) => !(x.startDate === group.startDate && x.endDate === group.endDate),
                          );
                          return [...others, { area, startDate: group.startDate, endDate: group.endDate }];
                        });
                      }}>
                        <SelectTrigger className="mt-1 h-9 text-sm">
                          {group.areas[0] ? (
                            <span>{areaMap.get(group.areas[0]) || group.areas[0]}</span>
                          ) : (
                            <span className="text-muted-foreground">Pilih area</span>
                          )}
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {availableAreas.map((a) => (
                            <SelectItem key={a} value={a}>{areaMap.get(a) || a}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Mulai <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        value={group.startDate.startsWith("__new_") ? "" : group.startDate}
                        onChange={(e) => {
                          const oldStart = group.startDate;
                          const oldEnd = group.endDate;
                          const newStart = e.target.value;
                          setJadwal((prev) =>
                            prev.map((x) =>
                              x.startDate === oldStart && x.endDate === oldEnd
                                ? { ...x, startDate: newStart }
                                : x,
                            ),
                          );
                        }}
                        className="mt-1 h-9 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Selesai <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        value={group.endDate.startsWith("__new_") ? "" : group.endDate}
                        onChange={(e) => {
                          const oldStart = group.startDate;
                          const oldEnd = group.endDate;
                          const newEnd = e.target.value;
                          setJadwal((prev) =>
                            prev.map((x) =>
                              x.startDate === oldStart && x.endDate === oldEnd
                                ? { ...x, endDate: newEnd }
                                : x,
                            ),
                          );
                        }}
                        className="mt-1 h-9 text-sm"
                        required
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setJadwal((prev) =>
                            prev.filter(
                              (x) => !(x.startDate === group.startDate && x.endDate === group.endDate),
                            ),
                          );
                        }}
                        className="h-9 w-9 text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  );
                })}
                {canAddBlock && (
                  <Button type="button" variant="ghost" size="sm" onClick={addBlock} className="h-7 text-xs gap-1">
                    <Plus className="w-3 h-3" /> Tambah
                  </Button>
                )}
                {!canAddBlock && (
                  <p className="text-[11px] text-muted-foreground">Maksimal 3 baris.</p>
                )}
              </div>
            )}
          </div>

          {/* ─── AO — mandatory, disable kalau belum isi tanggal ── */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              AO <span className="text-red-500">*</span>
            </label>
            {!hasDates && (
              <p className="text-[11px] text-muted-foreground mt-1">
                Isi tanggal terlebih dahulu untuk memilih AO.
              </p>
            )}
            {selectedAreas.length === 0 && hasDates && (
              <p className="text-[11px] text-muted-foreground mt-1">
                Pilih area terlebih dahulu untuk filter AO.
              </p>
            )}
            <div className={cn("mt-1.5", !hasDates && "opacity-50 pointer-events-none")}>
              <MultiSelect
                label={aoLabel}
                options={aoOptions}
                optionLabels={aoLabelMap}
                selected={aoIds}
                onChange={setAoIds}
                placeholder="Cari AO..."
                inline
              />
              {aoIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {aoIds.slice(0, 3).map((id) => (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium"
                    >
                      {aoLabelMap.get(id) || id}
                      <button
                        onClick={() => setAoIds((prev) => prev.filter((x) => x !== id))}
                        className="ml-0.5 hover:text-red-500 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {aoIds.length > 3 && (
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium cursor-default"
                      title={aoIds.map((id) => aoLabelMap.get(id) || id).join(", ")}
                    >
                      +{aoIds.length - 3} lainnya
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Catatan (opsional)</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Catatan program..."
              className="mt-1.5"
              rows={8}
            />
          </div>
        </div>
        

        {/* Footer (sticky) */}
        <div className="px-6 py-4 border-t border-border bg-secondary/20 flex items-center justify-end gap-3 shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="px-5">
            Batal
          </Button>
          <Button onClick={onSave} disabled={isPending || !isValid} className="px-5">
            {editProgram ? "Simpan Perubahan" : "Buat Program"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}