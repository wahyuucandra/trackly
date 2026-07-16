import { EmptyState } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { useAODashboard } from "@/hooks/useDashboard";
import { useAreaMap } from "@/services/query";
import { CalendarView } from "@/components/features/tasks/CalendarView";
import { BarChart3, CheckCircle, TrendingUp, Clock, Folder, ChevronRight, Target } from "lucide-react";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { StatCard } from "./StatCard";
import { Progress } from "@/components/ui/progress";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { formatDate } from "@/utils/formatters";
import { useRouter } from "next/navigation";

export function AODashboardView() {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user;
  const { programs, tasks, isLoading } = useAODashboard();
  const areaMap = useAreaMap();

  // All hooks must be called before any conditional return (Rules of Hooks)
  const derived = useMemo(() => {
    if (isLoading || !user) {
      return { myTasks: [] as typeof tasks, selesai: 0, pending: 0, berjalan: 0, myProgs: [] as typeof programs, calendarTasks: [] as { deadline: string; name: string; programName: string; status: "belum" | "berjalan" | "menunggu" | "selesai" }[] };
    }

    const myTasks = tasks.filter((t) => {
      const prog = programs.find((p) => p.id === t.programId);
      if (!prog) return false;
      const areas = (prog.jadwal || []).map((j) => j.area);
      if (!areas.some((a) => (user.area || []).includes(a))) return false;
      const pics = (t.pics || []).map((p) => p.userId);
      return !pics.length || pics.includes(user.id || "");
    });

    const selesai = myTasks.filter((t) => (t.statuses || []).some((s) => s.userId === user.id && s.isApproved)).length;
    const pending = myTasks.filter((t) => (t.statuses || []).some((s) => s.userId === user.id && s.isPendingApproval && !s.isApproved)).length;
    const berjalan = myTasks.filter((t) => (t.statuses || []).some((s) => s.userId === user.id && s.status === "berjalan" && !s.isApproved)).length;
    const myProgs = programs.filter((p) => myTasks.some((t) => t.programId === p.id));

    const calendarTasks = myTasks.map((t) => {
      const prog = programs.find((p) => p.id === t.programId);
      const st = (t.statuses || []).find((s) => s.userId === user.id);
      const isApproved = st?.isApproved ?? false;
      const isPending = (st?.isPendingApproval && !isApproved) ?? false;
      const status: "belum" | "berjalan" | "menunggu" | "selesai" = isApproved
        ? "selesai"
        : isPending
          ? "menunggu"
          : st?.status === "berjalan"
            ? "berjalan"
            : "belum";
      return {
        deadline: t.deadline,
        name: t.name,
        programName: prog?.name || "",
        status,
      };
    });

    return { myTasks, selesai, pending, berjalan, myProgs, calendarTasks };
  }, [isLoading, user, tasks, programs]);

  if (isLoading) return <DashboardSkeleton />;

  const { myTasks, selesai, pending, berjalan, myProgs, calendarTasks } = derived;

  const handletoTask = (programId: string) => {
    router.push(`/tasks?expand=${programId}`);
  }

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

      {/* Calendar */}
      <CalendarView tasks={calendarTasks} />

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Program di Area Saya</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myProgs.map((p) => {
            const pt = tasks.filter((t) => t.programId === p.id);
            const done = pt.filter((t) => (t.statuses || []).some((s) => s.isApproved)).length;
            const pct = pt.length ? Math.round((done / pt.length) * 100) : 0;
            return (
              <Card key={p.id} onClick={() => handletoTask(p.id)} className="hover:shadow-md transition-shadow group cursor-pointer">
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