"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multiselect";
import { Search, X } from "lucide-react";

interface DashboardFilterBarProps {
  areas: string[];
  search: string;
  allAreas: string[];
  areaMap: Map<string, string>;
  onChange: (filters: { areas?: string[]; search?: string }) => void;
  onReset: () => void;
}

export function DashboardFilterBar({
  areas,
  search,
  allAreas,
  areaMap,
  onChange,
  onReset,
}: DashboardFilterBarProps) {
  const hasFilters = areas.length > 0 || search;

  const areaLabel = areas.length === 0
    ? "Semua Area"
    : areas.length === 1
      ? (areaMap.get(areas[0]) || areas[0])
      : `${areas.length} area`;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <MultiSelect
        label={areaLabel}
        options={allAreas}
        optionLabels={areaMap}
        selected={areas}
        selectAllClears
        placeholder="Cari area..."
        onChange={(next) => onChange({ areas: next })}
      />
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cari AO..."
          value={search}
          onChange={(e) => onChange({ search: e.target.value })}
          className="pl-9 h-9 text-sm min-w-[200px]"
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