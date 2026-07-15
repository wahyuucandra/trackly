import { Card, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { DashboardFilters, getDefaultFilters, usePDODashboard } from "@/hooks/useDashboard";
import { useGcmList } from "@/hooks/useGcm";
import { useAreaMap } from "@/services/query";
import { BarChart3, CheckCircle, Clock, TrendingUp, User } from "lucide-react";
import { useState, useMemo } from "react";
import { DashboardFilterBar } from "./DashboardFilterBar";
import { ProgramChart } from "./ProgramChart";
import { StatCard } from "./StatCard";
import { MONTHS_ID } from "@/constants";
import { Progress } from "@/components/ui/progress";

export function PDODashboardView() {
  const [filters, setFilters] = useState<DashboardFilters>(getDefaultFilters());
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { stats, isLoading } = usePDODashboard(filters);
  const { gcm } = useGcmList();
  const areaMap = useAreaMap();

  // All areas from mst_gcm (active only) — same as users page
  const allAreas = useMemo(
    () => gcm.filter((g) => g.flag_active).map((g) => g.cd_value),
    [gcm],
  );

  const handleFilterChange = (partial: Partial<DashboardFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
    setPage(1);
  };

  const handleReset = () => {
    setFilters(getDefaultFilters());
    setPage(1);
  };

  if (isLoading) return null;

  const totalAO = stats.aoSummary.length;
  const pagedAO = stats.aoSummary.slice((page - 1) * limit, page * limit);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          {stats.isFallback
            ? "Ringkasan semua program"
            : `Ringkasan program ${MONTHS_ID[stats.month]} ${stats.year}`}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BarChart3} label={stats.isFallback ? "Total Program" : `Program ${MONTHS_ID[stats.month]}`} value={stats.aktifCount} accent="blue" />
        <StatCard icon={CheckCircle} label="Tugas Selesai" value={stats.tugasSelesai} accent="emerald" />
        <StatCard icon={Clock} label="Menunggu Verifikasi" value={stats.tugasPending} accent="amber" />
        <StatCard icon={TrendingUp} label="Total Tugas" value={stats.totalTugas} accent="slate" />
      </div>

      <ProgramChart
        title={stats.isFallback ? "Ringkasan Semua Program" : `Ringkasan Program Bulan ${MONTHS_ID[stats.month]} ${stats.year}`}
        slices={stats.slices}
      />

      {/* AO Summary */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="p-6 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground shrink-0">Ringkasan per AO</h3>
            <DashboardFilterBar
              areas={filters.areas}
              search={filters.search}
              allAreas={allAreas}
              areaMap={areaMap}
              onChange={handleFilterChange}
              onReset={handleReset}
            />
          </div>
          <div className="hidden md:block overflow-y-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left bg-secondary/50 border-b sticky top-0 z-10">
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">AO</th>
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Area</th>
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Total</th>
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Selesai</th>
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Progress</th>
                </tr>
              </thead>
              <tbody>
                {pagedAO.map((a, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="p-4 font-semibold"><User className="w-4 h-4 inline mr-2 text-muted-foreground"/>{a.name}</td>
                    <td className="p-4 text-muted-foreground">{a.area.map((a_code) => areaMap.get(a_code) || a_code).join(", ") || "-"}</td>
                    <td className="p-4 text-center">{a.total}</td>
                    <td className={`p-4 text-center font-semibold ${a.done === a.total && a.total > 0 ? "text-success" : ""}`}>{a.done}</td>
                    <td className="p-4 min-w-[180px]">
                      <div className="flex items-center gap-3">
                        <Progress value={a.pct} className="flex-1 h-2" />
                        <span className="text-sm font-semibold text-muted-foreground min-w-[40px] text-right">{a.pct}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {!pagedAO.length && <tr><td colSpan={5} className="p-10 text-center text-muted-foreground">Belum ada data AO</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="md:hidden divide-y divide-border max-h-[520px] overflow-y-auto">
            {pagedAO.map((a, i) => (
              <div key={i} className="p-4 hover:bg-secondary/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2"><User className="w-4 h-4 text-muted-foreground"/><span className="font-semibold">{a.name}</span></div>
                  <span className="text-sm text-muted-foreground">{a.area.map((a_code) => areaMap.get(a_code) || a_code).join(", ") || "-"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={a.pct} className="flex-1 h-1.5" />
                  <span className="text-sm font-semibold text-muted-foreground min-w-[40px] text-right">{a.pct}%</span>
                </div>
                <div className="flex justify-between mt-1.5 text-sm text-muted-foreground">
                  <span>{a.total} tugas</span>
                  <span className={a.done === a.total && a.total > 0 ? "text-success font-semibold" : ""}>{a.done} selesai</span>
                </div>
              </div>
            ))}
            {!pagedAO.length && <div className="p-10 text-center text-muted-foreground">Belum ada data AO</div>}
          </div>
          {totalAO > 0 && (
            <Pagination
              page={page}
              limit={limit}
              total={totalAO}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}