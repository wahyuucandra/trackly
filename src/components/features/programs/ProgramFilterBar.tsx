"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface ProgramFilterBarProps {
  filterType: string;
  setFilterType: (v: string) => void;
  filterArea: string;
  setFilterArea: (v: string) => void;
  filterSearch: string;
  setFilterSearch: (v: string) => void;
  allAreas: string[];
  areaMap: Map<string, string>;
}

export function ProgramFilterBar({ filterType, setFilterType, filterArea, setFilterArea, filterSearch, setFilterSearch, allAreas, areaMap }: ProgramFilterBarProps) {
  return (
    <div className="flex items-center gap-2.5 bg-card p-3.5 px-4 rounded-2xl border border-border mb-5 flex-wrap">
      <Select value={filterType} onValueChange={(v) => setFilterType(v ?? "")}>
        <SelectTrigger className="w-[160px] h-9 text-sm"><SelectValue placeholder="Semua Jenis" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Semua Jenis</SelectItem>
          <SelectItem value="Program Development">Program Development</SelectItem>
          <SelectItem value="Akademik">Akademik</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filterArea} onValueChange={(v) => setFilterArea(v ?? "")}>
        <SelectTrigger className="w-[160px] h-9 text-sm"><SelectValue placeholder="Semua Area" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Semua Area</SelectItem>
          {allAreas.map((a) => <SelectItem key={a} value={a}>{areaMap.get(a) || a}</SelectItem>)}
        </SelectContent>
      </Select>
      <Input placeholder="Cari program..." value={filterSearch} onChange={(e) => setFilterSearch(e.target.value)} className="flex-1 min-w-[140px] h-9" />
    </div>
  );
}