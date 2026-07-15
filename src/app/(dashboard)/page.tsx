"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { usePDODashboard, useAODashboard, getDefaultFilters, type DashboardFilters } from "@/hooks/useDashboard";
import { useAreaMap, useGcmList } from "@/hooks/useGcm";
import { EmptyState } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/features/dashboard/StatCard";
import { ProgramChart } from "@/components/features/dashboard/ProgramChart";
import { DashboardFilterBar } from "@/components/features/dashboard/DashboardFilterBar";
import { Pagination } from "@/components/ui/pagination";
import { Folder, User, TrendingUp, CheckCircle, Clock, BarChart3, Target, ChevronRight } from "lucide-react";
import { formatDate } from "@/utils/formatters";

const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

export default function DashboardPage() {
  const { data: session } = useSession();
  if (!session?.user) return null;
  return session.user.role === "Admin" ? <PDODashboardView /> : <AODashboardView />;
}

function PDODashboardView() {
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

  if (isLoading) return <DashboardSkeleton />;

  const totalAO = stats.aoSummary.length;
  const pagedAO = stats.aoSummary.slice((page - 1) * limit, page * limit);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          {stats.isFallback
            ? "Ringkasan semua program"
            : `Ringkasan program ${MONTHS[stats.month]} ${stats.year}`}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BarChart3} label={stats.isFallback ? "Total Program" : `Program ${MONTHS[stats.month]}`} value={stats.aktifCount} accent="blue" />
        <StatCard icon={CheckCircle} label="Tugas Selesai" value={stats.tugasSelesai} accent="emerald" />
        <StatCard icon={Clock} label="Menunggu Verifikasi" value={stats.tugasPending} accent="amber" />
        <StatCard icon={TrendingUp} label="Total Tugas" value={stats.totalTugas} accent="slate" />
      </div>

      <ProgramChart
        title={stats.isFallback ? "Ringkasan Semua Program" : `Ringkasan Program Bulan ${MONTHS[stats.month]} ${stats.year}`}
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

function AODashboardView() {
  const { data: session } = useSession();
  const user = session?.user;
  const { programs, tasks } = useAODashboard();
  const areaMap = useAreaMap();
  const myTasks = tasks.filter((t) => {
    const prog = programs.find((p) => p.id === t.programId);
    if (!prog) return false;
    const areas = (prog.jadwal || []).map((j) => j.area);
    if (!areas.some((a) => (user?.area || []).includes(a))) return false;
    const pics = (t.pics || []).map((p) => p.userId);
    return !pics.length || pics.includes(user?.id || "");
  });
  const selesai = myTasks.filter((t) => (t.statuses || []).some((s) => s.userId === user?.id && s.isApproved)).length;
  const pending = myTasks.filter((t) => (t.statuses || []).some((s) => s.userId === user?.id && s.isPendingApproval && !s.isApproved)).length;
  const berjalan = myTasks.filter((t) => (t.statuses || []).some((s) => s.userId === user?.id && s.status === "berjalan" && !s.isApproved)).length;
  const myProgs = programs.filter((p) => myTasks.some((t) => t.programId === p.id));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard — Area {(user?.area || []).map((a) => areaMap.get(a) || a).join(", ")}</h1>
        <p className="text-muted-foreground mt-1">{myTasks.length} tugas aktif</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BarChart3} label="Total Tugas" value={myTasks.length} accent="blue" />
        <StatCard icon={CheckCircle} label="Selesai" value={selesai} accent="emerald" />
        <StatCard icon={TrendingUp} label="Berjalan" value={berjalan} accent="slate" />
        <StatCard icon={Clock} label="Menunggu Verifikasi" value={pending} accent="amber" />
      </div>
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Program di Area Saya</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myProgs.map((p) => {
            const pt = tasks.filter((t) => t.programId === p.id);
            const done = pt.filter((t) => (t.statuses || []).some((s) => s.isApproved)).length;
            const pct = pt.length ? Math.round((done / pt.length) * 100) : 0;
            return (
              <Card key={p.id} className="hover:shadow-md transition-shadow group cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 rounded-lg bg-secondary"><Folder className="w-4 h-4 text-muted-foreground" /></div>
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate">{p.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {(p.jadwal || []).filter((j) => (user?.area || []).includes(j.area))
                            .map((j) => j.startDate && j.endDate ? `${areaMap.get(j.area) || j.area}: ${formatDate(j.startDate)} - ${formatDate(j.endDate)}` : (areaMap.get(j.area) || j.area)).join(" · ")}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-foreground transition-colors shrink-0" />
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={pct} className="flex-1 h-1.5" />
                    <span className="text-sm font-semibold text-muted-foreground min-w-[36px] text-right">{pct}%</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-right mt-1.5">{done}/{pt.length} tugas selesai</p>
                </CardContent>
              </Card>
            );
          })}
          {!myProgs.length && <EmptyState icon={<Target className="w-10 h-10" />} title="Belum ada program di area Anda" description="Program akan muncul setelah ditugaskan ke area Anda." />}
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-10 w-48" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map((i) => <Skeleton key={i} className="h-[110px] rounded-2xl" />)}
      </div>
      <Skeleton className="h-[320px] rounded-2xl" />
      <Skeleton className="h-[300px] rounded-2xl" />
    </div>
  );
}