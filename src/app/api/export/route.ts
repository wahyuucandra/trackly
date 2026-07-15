import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "Admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const areaRaw = searchParams.get("area") || "";
  const aoRaw = searchParams.get("ao") || "";
  const programRaw = searchParams.get("program") || "";
  const statusRaw = searchParams.get("status") || "";

  const areaFilter = areaRaw ? areaRaw.split(",").filter(Boolean) : [];
  const aoFilter = aoRaw ? aoRaw.split(",").filter(Boolean) : [];
  const programFilter = programRaw ? programRaw.split(",").filter(Boolean) : [];
  const statusFilters = statusRaw ? statusRaw.split(",").filter(Boolean) : [];

  // Fetch mst_gcm for cd_value → desc_value mapping
  const gcm = await prisma.mstGcm.findMany({ select: { cd_value: true, desc_value: true } });
  const areaMap = new Map(gcm.map((g) => [g.cd_value, g.desc_value]));

  const programs = await prisma.program.findMany({
    include: { jadwal: true, aos: { include: { user: { select: { id: true, name: true, username: true } } } } },
  });

  const tasks = await prisma.task.findMany({
    include: {
      pics: { include: { user: { select: { id: true, name: true, username: true } } } },
      statuses: true,
    },
  });

  const rows: string[][] = [["Program", "Area", "Tugas", "Deadline", "AO", "Status", "Catatan AO", "Disetujui", "Bukti"]];

  const skipByStatus = (s: { status?: string; isApproved?: boolean } | undefined) => {
    if (statusFilters.length === 0) return false;
    const st = s?.status || "belum";
    if (statusFilters.includes("selesai") && s?.isApproved) return false;
    if (statusFilters.includes(st)) return false;
    return true;
  };

  tasks.forEach((t) => {
    const prog = programs.find((p) => p.id === t.programId);
    if (!prog) return;
    if (programFilter.length > 0 && !programFilter.includes(prog.id)) return;

    const progAreas = prog.jadwal.map((j) => j.area);
    if (areaFilter.length > 0 && !progAreas.some((a) => areaFilter.includes(a))) return;

    const areaNames = progAreas.map((a) => areaMap.get(a) || a).join(", ");

    const taskAOs = t.pics.map((p) => p.userId);
    const candidateAOs = aoFilter.length > 0 ? taskAOs.filter((a) => aoFilter.includes(a)) : (taskAOs.length ? taskAOs : null);

    if (candidateAOs === null) {
      const progAOs = prog.aos.map((a) => a.userId);
      const filtered = aoFilter.length > 0 ? progAOs.filter((a) => aoFilter.includes(a)) : progAOs;
      filtered.forEach((userId) => {
        const status = t.statuses.find((s) => s.userId === userId);
        if (skipByStatus(status)) return;
        const user = prog.aos.find((a) => a.userId === userId)?.user;
        rows.push([
          prog.name, areaNames, t.name, t.deadline,
          user?.name || userId, status?.status || "belum",
          status?.notes || "", status?.isApproved ? "Ya" : "Tidak",
          t.evidenceUrl || "",
        ]);
      });
      return;
    }

    candidateAOs.forEach((userId) => {
      const status = t.statuses.find((s) => s.userId === userId);
      if (skipByStatus(status)) return;
      const user = t.pics.find((p) => p.userId === userId)?.user;
      rows.push([
        prog.name, areaNames, t.name, t.deadline,
        user?.name || userId, status?.status || "belum",
        status?.notes || "", status?.isApproved ? "Ya" : "Tidak",
        t.evidenceUrl || "",
      ]);
    });
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  const colWidths = rows[0].map((_, i) => Math.min(Math.max(...rows.map((r) => String(r[i] || "").length)) * 1.5, 50));
  ws["!cols"] = colWidths.map((w) => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Laporan");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  const now = new Date();
  const ts = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename=laporan_monitoring_${ts}.xlsx`,
    },
  });
}