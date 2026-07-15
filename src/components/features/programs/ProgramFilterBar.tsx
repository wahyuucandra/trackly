"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multiselect";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X } from "lucide-react";

interface ProgramFilterBarProps {
  filterType: string;
  filterAreas: string[];
  filterSearch: string;
  allAreas: string[];
  areaMap: Map<string, string>;
  hasFilters: boolean;
  onChange: (partial: { type?: string; areas?: string[]; search?: string }) => void;
  onReset: () => void;
}

export function ProgramFilterBar({
  filterType,
  filterAreas,
  filterSearch,
  allAreas,
  areaMap,
  hasFilters,
  onChange,
  onReset,
}: ProgramFilterBarProps) {
  const areaLabel = filterAreas.length === 0
    ? "Semua Area"
    : filterAreas.length === 1
      ? (areaMap.get(filterAreas[0]) || filterAreas[0])
      : `${filterAreas.length} area`;

  return (
    <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3 flex-wrap">
      <Select value={filterType} onValueChange={(v) => onChange({ type: (v === "none" || v === null) ? "" : v })}>
        <SelectTrigger className="w-[170px] h-9 text-sm"><SelectValue placeholder="Semua Jenis" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Semua Jenis</SelectItem>
          <SelectItem value="Program Development">Program Development</SelectItem>
          <SelectItem value="Akademik">Akademik</SelectItem>
        </SelectContent>
      </Select>
      <MultiSelect
        label={areaLabel}
        options={allAreas}
        optionLabels={areaMap}
        selected={filterAreas}
        placeholder="Cari area..."
        onChange={(next) => onChange({ areas: next })}
      />
      <div className="flex-1" />
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cari program..."
          value={filterSearch}
          onChange={(e) => onChange({ search: e.target.value })}
          className="pl-9 h-9 text-sm min-w-[220px]"
        />
      </div>
      {hasFilters && (
        <Button variant="outline" size="sm" onClick={onReset} className="h-9 text-sm gap-1.5">
          <X className="w-4 h-4" /> Reset
        </Button>
      )}
    </div>
  );
}