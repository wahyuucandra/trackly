"use client";

import { useState, useMemo } from "react";
import { useUsersQuery } from "@/services/query/useUsersQuery";
import { useProgramsQuery } from "@/services/query/useProgramsQuery";
import { useGcmList, useAreaMap } from "@/hooks/useGcm";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multiselect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileSpreadsheet, RotateCcw } from "lucide-react";

const STATUS_OPTIONS = ["belum", "berjalan", "selesai"];
const STATUS_MAP = new Map([
  ["belum", "Belum"],
  ["berjalan", "Berjalan"],
  ["selesai", "Selesai"],
]);

export default function ExportPage() {
  const [areas, setAreas] = useState<string[]>([]);
  const [aos, setAOs] = useState<string[]>([]);
  const [programIds, setProgramIds] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);

  const { gcm, isLoading: gcmLoading } = useGcmList();
  const areaMap = useAreaMap();

  const { users: allUsers, isLoading: usersLoading } = useUsersQuery();
  const { programs: allPrograms, isLoading: progsLoading } = useProgramsQuery();
  const aoUsers = allUsers.filter((u) => u.role === "AO");

  const allAreas = useMemo(() => gcm.filter((g) => g.flag_active).map((g) => g.cd_value), [gcm]);

  const isLoading = usersLoading || progsLoading || gcmLoading;
  if (isLoading) return null;

  const hasFilters = areas.length > 0 || aos.length > 0 || programIds.length > 0 || statuses.length > 0;

  const handleReset = () => {
    setAreas([]);
    setAOs([]);
    setProgramIds([]);
    setStatuses([]);
  };

  const areaLabel = areas.length === 0 ? "Semua Area" : areas.length === 1 ? (areaMap.get(areas[0]) || areas[0]) : `${areas.length} area`;
  const aoLabel = aos.length === 0 ? "Semua AO" : aos.length === 1 ? (aoUsers.find((u) => u.id === aos[0])?.name || aos[0]) : `${aos.length} AO`;
  const progLabel = programIds.length === 0 ? "Semua Program" : programIds.length === 1 ? (allPrograms.find((p) => p.id === programIds[0])?.name || programIds[0]) : `${programIds.length} program`;
  const statusLabel = statuses.length === 0 ? "Semua Status" : statuses.length === 1 ? (STATUS_MAP.get(statuses[0]) || statuses[0]) : `${statuses.length} status`;

  const handleExport = () => {
    const params = new URLSearchParams();
    if (areas.length > 0) params.set("area", areas.join(","));
    if (aos.length > 0) params.set("ao", aos.join(","));
    if (programIds.length > 0) params.set("program", programIds.join(","));
    if (statuses.length > 0) params.set("status", statuses.join(","));
    window.open(`/api/export?${params.toString()}`, "_blank");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Export Laporan</h1>
        <p className="text-muted-foreground text-sm">Download laporan dalam format Excel dengan filter yang fleksibel</p>
      </div>

      <Card className="overflow-visible">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><FileSpreadsheet className="w-5 h-5" /> Download Laporan XLSX</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 overflow-visible">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="overflow-visible">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Area</label>
              <MultiSelect
                label={areaLabel}
                options={allAreas}
                optionLabels={areaMap}
                selected={areas}
                onChange={setAreas}
                placeholder="Cari area..."
              />
            </div>
            <div className="overflow-visible">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">AO</label>
              <MultiSelect
                label={aoLabel}
                options={aoUsers.map((u) => u.id)}
                optionLabels={new Map(aoUsers.map((u) => [u.id, u.name]))}
                selected={aos}
                onChange={setAOs}
                placeholder="Cari AO..."
              />
            </div>
            <div className="overflow-visible">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Program</label>
              <MultiSelect
                label={progLabel}
                options={allPrograms.map((p) => p.id)}
                optionLabels={new Map(allPrograms.map((p) => [p.id, p.name]))}
                selected={programIds}
                onChange={setProgramIds}
                placeholder="Cari program..."
              />
            </div>
            <div className="overflow-visible">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Status</label>
              <MultiSelect
                label={statusLabel}
                options={STATUS_OPTIONS}
                optionLabels={STATUS_MAP}
                selected={statuses}
                onChange={setStatuses}
                placeholder="Cari status..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            {hasFilters && (
              <Button variant="outline" size="sm" onClick={handleReset} className="h-9 text-sm gap-1.5">
                <RotateCcw className="w-4 h-4" /> Reset Filter
              </Button>
            )}
            <Button onClick={handleExport} size="lg" className="gap-2">
              <Download className="w-4 h-4" /> Export XLSX
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}