import { hash } from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.approvalLog.deleteMany();
  await prisma.taskStatus.deleteMany();
  await prisma.taskPIC.deleteMany();
  await prisma.task.deleteMany();
  await prisma.programAO.deleteMany();
  await prisma.jadwal.deleteMany();
  await prisma.program.deleteMany();
  await prisma.user.deleteMany();
  await prisma.mstGcm.deleteMany();

  const pw = await hash("Admin123!", 12);
  const aoPw = await hash("Password1!", 12);

  // ── MstGcm (Master Area) ──
  const gcmData = [
    { condition: "mst_area", cd_value: "01", desc_value: "Surabaya", flag_active: true },
    { condition: "mst_area", cd_value: "02", desc_value: "Jakarta", flag_active: true },
    { condition: "mst_area", cd_value: "03", desc_value: "Bandung", flag_active: true },
    { condition: "mst_area", cd_value: "04", desc_value: "Malang", flag_active: true },
    { condition: "mst_area", cd_value: "05", desc_value: "Semarang", flag_active: true },
    { condition: "mst_area", cd_value: "06", desc_value: "Medan", flag_active: true },
    { condition: "mst_area", cd_value: "07", desc_value: "Makassar", flag_active: true },
    { condition: "mst_area", cd_value: "08", desc_value: "Denpasar", flag_active: true },
    { condition: "mst_area", cd_value: "09", desc_value: "Palembang", flag_active: false },
    { condition: "mst_area", cd_value: "10", desc_value: "Yogyakarta", flag_active: true },
  ];
  await prisma.mstGcm.createMany({ data: gcmData });
  console.log("✅ 10 mst_gcm entries");

  // ── Users ──
  const admin = await prisma.user.create({
    data: { username: "admin", passwordHash: pw, name: "Admin", role: "Admin", area: [], permissions: { dashboard: true, programs: true, approvals: true, export: true, tasks: false, users: true } },
  });

  const aoSpecs = [
    { username: "andri",    name: "Andri Prasetyo",   area: ["01"] },
    { username: "puja",     name: "Puja Lestari",      area: ["01"] },
    { username: "banu",     name: "Banu Wiratama",     area: ["01"] },
    { username: "sandy",    name: "Sandy Gunawan",     area: ["02"] },
    { username: "ferdinan", name: "Ferdinan Kusuma",   area: ["02"] },
    { username: "febri",    name: "Febri Hermawan",    area: ["02", "03"] },
    { username: "bagus",    name: "Bagus Prakoso",     area: ["03"] },
    { username: "rani",     name: "Rani Maulidya",     area: ["01", "04"] },
    { username: "dian",     name: "Dian Permata",      area: ["04"] },
    { username: "hendra",   name: "Hendra Wijaya",     area: ["03"] },
    { username: "novita",   name: "Novita Sari",       area: ["02"] },
    { username: "rizky",    name: "Rizky Aditya",      area: ["01", "02"] },
  ];

  const aos: Record<string, string> = {};
  for (const a of aoSpecs) {
    const u = await prisma.user.create({
      data: { username: a.username, passwordHash: aoPw, name: a.name, role: "AO", area: a.area, permissions: { dashboard: true, tasks: true, programs: false, approvals: false, export: false, users: false } },
    });
    aos[a.username] = u.id;
  }
  console.log("✅ 13 users (1 admin + 12 AO)");

  // ── Programs ──
  const progSpecs = [
    { name: "Program Literasi Digital", type: "Program Development", notes: "Fokus pada pelatihan internet dasar untuk masyarakat" },
    { name: "Pemberdayaan UMKM 2026",   type: "Program Development", notes: "Prioritas UMKM kuliner dan kerajinan tangan" },
    { name: "Beasiswa SD Juara",        type: "Akademik",            notes: "Beasiswa untuk 50 siswa SD di area Surabaya" },
    { name: "Bimbel SMP Terpadu",       type: "Akademik",            notes: "Bimbingan belajar matematika & IPA untuk SMP" },
    { name: "Kampung Sehat Mandiri",    type: "Program Development", notes: "Program kesehatan lingkungan & sanitasi warga" },
    { name: "Beasiswa SMA Prestasi",    type: "Akademik",            notes: "Beasiswa untuk 30 siswa SMA berprestasi di Jakarta & Bandung" },
  ];
  const progs: Record<string, string> = {};
  for (let i = 0; i < progSpecs.length; i++) {
    const p = await prisma.program.create({ data: { ...progSpecs[i], createdById: admin.id } });
    progs[`p${i + 1}`] = p.id;
  }
  console.log("✅ 6 programs");

  // ── Jadwal ──
  const jadwalData: { programId: string; area: string; startDate: string; endDate: string }[] = [
    { programId: progs.p1, area: "01", startDate: "2026-06-01", endDate: "2026-08-31" },
    { programId: progs.p1, area: "02",  startDate: "2026-07-01", endDate: "2026-09-15" },
    { programId: progs.p2, area: "02",  startDate: "2026-06-15", endDate: "2026-09-15" },
    { programId: progs.p2, area: "03",  startDate: "2026-07-01", endDate: "2026-10-01" },
    { programId: progs.p3, area: "01", startDate: "2026-06-01", endDate: "2026-12-31" },
    { programId: progs.p3, area: "04",   startDate: "2026-07-01", endDate: "2026-12-31" },
    { programId: progs.p4, area: "01", startDate: "2026-06-01", endDate: "2026-11-30" },
    { programId: progs.p4, area: "02",  startDate: "2026-07-15", endDate: "2026-11-30" },
    { programId: progs.p4, area: "03",  startDate: "2026-08-01", endDate: "2026-11-30" },
    { programId: progs.p5, area: "01", startDate: "2026-07-01", endDate: "2026-09-30" },
    { programId: progs.p5, area: "04",   startDate: "2026-07-15", endDate: "2026-09-30" },
    { programId: progs.p6, area: "02",  startDate: "2026-06-01", endDate: "2026-12-31" },
    { programId: progs.p6, area: "03",  startDate: "2026-07-01", endDate: "2026-12-31" },
  ];
  await prisma.jadwal.createMany({ data: jadwalData });
  console.log("✅ 13 jadwal");

  // ── Program AOs ──
  const pa = (pid: string, uid: string) => ({ programId: pid, userId: uid });
  await prisma.programAO.createMany({ data: [
    pa(progs.p1, aos.andri), pa(progs.p1, aos.puja), pa(progs.p1, aos.banu),
    pa(progs.p1, aos.sandy), pa(progs.p1, aos.ferdinan),
    pa(progs.p2, aos.sandy), pa(progs.p2, aos.ferdinan), pa(progs.p2, aos.febri),
    pa(progs.p2, aos.bagus),
    pa(progs.p3, aos.andri), pa(progs.p3, aos.puja), pa(progs.p3, aos.rani),
    pa(progs.p4, aos.andri), pa(progs.p4, aos.banu),
    pa(progs.p4, aos.sandy), pa(progs.p4, aos.febri), pa(progs.p4, aos.bagus),
    pa(progs.p5, aos.puja), pa(progs.p5, aos.rani),
    pa(progs.p6, aos.sandy), pa(progs.p6, aos.ferdinan), pa(progs.p6, aos.bagus),
    // New AOs
    pa(progs.p3, aos.dian), pa(progs.p5, aos.dian),
    pa(progs.p2, aos.hendra), pa(progs.p4, aos.hendra), pa(progs.p6, aos.hendra),
    pa(progs.p1, aos.novita), pa(progs.p2, aos.novita), pa(progs.p4, aos.novita),
    pa(progs.p1, aos.rizky), pa(progs.p2, aos.rizky), pa(progs.p3, aos.rizky), pa(progs.p5, aos.rizky),
  ]});
  console.log("✅ 34 program-AO assignments");

  // ── Tasks ──
  const taskSpecs: { name: string; programId: string; deadline: string; notes?: string; evidenceUrl?: string; updatedAt?: string }[] = [
    { name: "Survei awal peserta",              programId: progs.p1, deadline: "2026-07-10", notes: "Min. 50 responden per area", evidenceUrl: "https://example.com/survei.jpg", updatedAt: "2026-06-20" },
    { name: "Pelatihan modul 1 — Internet Dasar", programId: progs.p1, deadline: "2026-07-25", notes: "Materi: browsing, email, media sosial", updatedAt: "2026-06-22" },
    { name: "Pelatihan modul 2 — Keamanan Digital", programId: progs.p1, deadline: "2026-08-10", notes: "Materi: password, phishing, privasi" },
    { name: "Evaluasi akhir program",          programId: progs.p1, deadline: "2026-08-28", notes: "Kuesioner kepuasan + test akhir" },
    { name: "Pemetaan UMKM sasaran",           programId: progs.p2, deadline: "2026-07-20", notes: "Target 100 UMKM", evidenceUrl: "https://example.com/peta.png", updatedAt: "2026-06-21" },
    { name: "Workshop pemasaran digital",      programId: progs.p2, deadline: "2026-08-10", notes: "Bekerjasama dengan dinas perdagangan" },
    { name: "Pelatihan pembukuan sederhana",   programId: progs.p2, deadline: "2026-08-25", notes: "Menggunakan aplikasi buku kas" },
    { name: "Monitoring dan evaluasi UMKM",    programId: progs.p2, deadline: "2026-09-10", notes: "Kunjungan ke 50 UMKM terpilih" },
    { name: "Verifikasi data siswa",           programId: progs.p3, deadline: "2026-07-15", notes: "Cek NIK, KK, rapor terakhir", updatedAt: "2026-06-25" },
    { name: "Penyaluran dana tahap 1",         programId: progs.p3, deadline: "2026-08-01", notes: "Transfer ke rekening wali murid" },
    { name: "Monitoring nilai semester",       programId: progs.p3, deadline: "2026-10-15", notes: "Ambil rapor mid-semester" },
    { name: "Pendataan siswa bimbel",          programId: progs.p4, deadline: "2026-07-10", notes: "Target 100 siswa per area", updatedAt: "2026-06-22" },
    { name: "Sesi bimbel matematika #1",       programId: progs.p4, deadline: "2026-08-05", notes: "Topik: aljabar & geometri" },
    { name: "Sesi bimbel IPA #1",              programId: progs.p4, deadline: "2026-08-20", notes: "Topik: fisika dasar" },
    { name: "Try out ujian akhir",             programId: progs.p4, deadline: "2026-10-01", notes: "Simulasi ujian nasional" },
    { name: "Sosialisasi pola hidup bersih",   programId: progs.p5, deadline: "2026-07-20", notes: "Penyuluhan ke 10 RW di Surabaya", updatedAt: "2026-07-01" },
    { name: "Pembangunan MCK umum",            programId: progs.p5, deadline: "2026-08-15", notes: "Target 5 titik MCK" },
    { name: "Pengadaan tempat sampah",         programId: progs.p5, deadline: "2026-07-30", notes: "50 unit tempat sampah pilah" },
    { name: "Seleksi berkas calon penerima",   programId: progs.p6, deadline: "2026-07-15", notes: "Verifikasi rapor & prestasi", evidenceUrl: "https://example.com/seleksi.pdf", updatedAt: "2026-06-28" },
    { name: "Wawancara kandidat",              programId: progs.p6, deadline: "2026-07-30", notes: "Panel wawancara 3 orang" },
  ];
  const tasks: Record<string, string> = {};
  for (let i = 0; i < taskSpecs.length; i++) {
    const t = taskSpecs[i];
    const created = await prisma.task.create({
      data: { name: t.name, programId: t.programId, deadline: t.deadline, notes: t.notes || null, evidenceUrl: t.evidenceUrl || null, createdById: admin.id, updatedAt: t.updatedAt || "" },
    });
    tasks[`t${i + 1}`] = created.id;
  }
  console.log("✅ 20 tasks");

  // ── Task PICs ──
  const tp = (tid: string, uid: string) => ({ taskId: tid, userId: uid });
  await prisma.taskPIC.createMany({ data: [
    tp(tasks.t1, aos.andri), tp(tasks.t1, aos.sandy),
    tp(tasks.t2, aos.andri), tp(tasks.t2, aos.puja), tp(tasks.t2, aos.banu),
    tp(tasks.t3, aos.andri), tp(tasks.t3, aos.banu),
    tp(tasks.t4, aos.andri), tp(tasks.t4, aos.puja),
    tp(tasks.t5, aos.sandy), tp(tasks.t5, aos.febri),
    tp(tasks.t6, aos.sandy), tp(tasks.t6, aos.ferdinan),
    tp(tasks.t7, aos.febri), tp(tasks.t7, aos.bagus),
    tp(tasks.t8, aos.sandy), tp(tasks.t8, aos.bagus),
    tp(tasks.t9, aos.andri), tp(tasks.t9, aos.rani),
    tp(tasks.t10, aos.puja), tp(tasks.t10, aos.rani),
    tp(tasks.t11, aos.andri), tp(tasks.t11, aos.puja),
    tp(tasks.t12, aos.banu), tp(tasks.t12, aos.sandy),
    tp(tasks.t13, aos.andri), tp(tasks.t13, aos.banu),
    tp(tasks.t14, aos.sandy), tp(tasks.t14, aos.febri),
    tp(tasks.t15, aos.bagus), tp(tasks.t15, aos.andri),
    tp(tasks.t16, aos.puja), tp(tasks.t16, aos.rani),
    tp(tasks.t17, aos.puja), tp(tasks.t17, aos.rani),
    tp(tasks.t18, aos.puja),
    tp(tasks.t19, aos.sandy), tp(tasks.t19, aos.ferdinan),
    tp(tasks.t20, aos.sandy), tp(tasks.t20, aos.bagus),
    // New AO task PICs
    tp(tasks.t9, aos.dian), tp(tasks.t10, aos.dian), tp(tasks.t16, aos.dian),
    tp(tasks.t6, aos.hendra), tp(tasks.t12, aos.hendra), tp(tasks.t19, aos.hendra),
    tp(tasks.t2, aos.novita), tp(tasks.t5, aos.novita), tp(tasks.t13, aos.novita),
    tp(tasks.t1, aos.rizky), tp(tasks.t5, aos.rizky), tp(tasks.t9, aos.rizky), tp(tasks.t17, aos.rizky),
  ]});
  console.log("✅ 53 task PICs");

  // ── Task Statuses ──
  const ts = (tid: string, uid: string, status: string, isPendingApproval: boolean, isApproved: boolean, notes?: string) =>
    ({ taskId: tid, userId: uid, status, isPendingApproval, isApproved, notes: notes || null });
  await prisma.taskStatus.createMany({ data: [
    ts(tasks.t1, aos.andri, "selesai", true, false, "Sudah survey 60 responden, menunggu verifikasi"),
    ts(tasks.t1, aos.sandy, "selesai", true, false, "Survey 55 responden di Jakarta"),
    ts(tasks.t2, aos.andri, "berjalan", false, false, "Pelatihan sudah 2 sesi, masih 3 sesi lagi"),
    ts(tasks.t2, aos.puja, "berjalan", false, false),
    ts(tasks.t2, aos.banu, "belum", false, false),
    ts(tasks.t5, aos.sandy, "berjalan", false, false, "Sudah mapping 40 UMKM"),
    ts(tasks.t5, aos.febri, "berjalan", false, false, "Mapping 30 UMKM di Bandung"),
    ts(tasks.t9, aos.andri, "selesai", false, true, "Verifikasi 50 siswa selesai"),
    ts(tasks.t9, aos.rani, "selesai", false, true, "Verifikasi 25 siswa di Malang"),
    ts(tasks.t12, aos.banu, "berjalan", false, false, "Sudah daftar 40 siswa"),
    ts(tasks.t12, aos.sandy, "berjalan", false, false),
    ts(tasks.t13, aos.andri, "selesai", true, false, "Bimbel selesai, 45 siswa hadir"),
    ts(tasks.t13, aos.banu, "berjalan", false, false),
    ts(tasks.t3, aos.andri, "belum", false, false),
    ts(tasks.t3, aos.banu, "belum", false, false),
    ts(tasks.t4, aos.andri, "belum", false, false),
    ts(tasks.t4, aos.puja, "belum", false, false),
    ts(tasks.t6, aos.sandy, "belum", false, false),
    ts(tasks.t6, aos.ferdinan, "belum", false, false),
    ts(tasks.t7, aos.febri, "belum", false, false),
    ts(tasks.t7, aos.bagus, "belum", false, false),
    ts(tasks.t8, aos.sandy, "belum", false, false),
    ts(tasks.t8, aos.bagus, "belum", false, false),
    ts(tasks.t10, aos.puja, "belum", false, false),
    ts(tasks.t10, aos.rani, "belum", false, false),
    ts(tasks.t11, aos.andri, "belum", false, false),
    ts(tasks.t11, aos.puja, "belum", false, false),
    ts(tasks.t14, aos.sandy, "belum", false, false),
    ts(tasks.t14, aos.febri, "belum", false, false),
    ts(tasks.t15, aos.bagus, "belum", false, false),
    ts(tasks.t15, aos.andri, "belum", false, false),
    // New AO task statuses
    ts(tasks.t9, aos.dian, "berjalan", false, false, "Mulai verifikasi data siswa Malang"),
    ts(tasks.t10, aos.dian, "belum", false, false),
    ts(tasks.t16, aos.dian, "belum", false, false),
    ts(tasks.t6, aos.hendra, "belum", false, false),
    ts(tasks.t12, aos.hendra, "berjalan", false, false, "Sudah daftar 30 siswa di Bandung"),
    ts(tasks.t19, aos.hendra, "selesai", true, false, "Verifikasi 15 berkas di Bandung"),
    ts(tasks.t2, aos.novita, "berjalan", false, false, "Pelatihan Jakarta sesi 1 selesai"),
    ts(tasks.t5, aos.novita, "selesai", false, true, "Mapping 25 UMKM Jakarta selesai"),
    ts(tasks.t13, aos.novita, "belum", false, false),
    ts(tasks.t1, aos.rizky, "selesai", true, false, "Survey 40 responden Surabaya-Jakarta"),
    ts(tasks.t5, aos.rizky, "berjalan", false, false, "Mapping 20 UMKM"),
    ts(tasks.t9, aos.rizky, "selesai", false, true, "Verifikasi 20 siswa Surabaya"),
    ts(tasks.t17, aos.rizky, "belum", false, false),
  ]});
  console.log("✅ 45 task statuses");

  console.log("🎉 Seeding complete! 13 users, 6 programs, 20 tasks");
}

main()
  .catch((e) => { console.error("❌ Seed error:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });