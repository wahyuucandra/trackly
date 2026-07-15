export const ROLES = {
  ADMIN: "Admin",
  AO: "AO",
} as const;

export const DEFAULT_PERMISSIONS = {
  dashboard: true,
  tasks: false,
  programs: false,
  approvals: false,
  export: false,
  users: false,
} as const;

export const ADMIN_PERMISSIONS = {
  dashboard: true,
  tasks: false,
  programs: true,
  approvals: true,
  export: true,
  users: true,
} as const;

export const AO_PERMISSIONS = {
  dashboard: true,
  tasks: true,
  programs: false,
  approvals: false,
  export: false,
  users: false,
} as const;

export const TASK_STATUS = {
  BELUM: "belum",
  BERJALAN: "berjalan",
  SELESAI: "selesai",
} as const;

export const PROGRAM_TYPES = {
  PROGRAM_DEVELOPMENT: "Program Development",
  AKADEMIK: "Akademik",
} as const;

export const AO_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#dc2626",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#0891b2",
  "#4f46e5",
  "#9333ea",
  "#e11d48",
  "#d97706",
] as const;

export const MONTHS_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
] as const;

export const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
] as const;

export const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"] as const;