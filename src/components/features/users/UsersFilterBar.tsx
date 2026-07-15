"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multiselect";
import { Search, X } from "lucide-react";

interface UsersFilterBarProps {
  areas: string[];
  roles: string[];
  search: string;
  allAreas: string[];
  areaMap: Map<string, string>;
  onChange: (filters: { areas?: string[]; roles?: string[]; search?: string }) => void;
  onReset: () => void;
}

export function UsersFilterBar({
  areas,
  roles,
  search,
  allAreas,
  areaMap,
  onChange,
  onReset,
}: UsersFilterBarProps) {
  const hasFilters = areas.length > 0 || roles.length > 0 || search;

  const areaLabel = areas.length === 0
    ? "Semua Area"
    : areas.length === 1
      ? (areaMap.get(areas[0]) || areas[0])
      : `${areas.length} area`;

  const roleLabel = roles.length === 0 ? "Semua Role" : roles.length === 1 ? roles[0] : `${roles.length} role`;

  return (
    <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3 flex-wrap">
      <MultiSelect
        label={areaLabel}
        options={allAreas}
        optionLabels={areaMap}
        selected={areas}
        selectAllClears
        placeholder="Cari area..."
        onChange={(next) => onChange({ areas: next })}
      />
      <MultiSelect
        label={roleLabel}
        options={["Admin", "AO"]}
        selected={roles}
        onChange={(next) => onChange({ roles: next })}
      />
      <div className="flex-1" />
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cari nama..."
          value={search}
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