// ============================================================
// Global Types
// ============================================================

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: "Admin" | "AO";
  area: string[];
  permissions: UserPermissions;
  createdAt: string;
  updatedAt: string;
}

export interface UserPermissions {
  [key: string]: boolean;
  dashboard: boolean;
  tasks: boolean;
  programs: boolean;
  approvals: boolean;
  export: boolean;
  users: boolean;
}

export interface Program {
  id: string;
  name: string;
  type: ProgramType;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  jadwal: Jadwal[];
  aos: ProgramAO[];
  tasks: Task[];
  createdBy?: Pick<User, "id" | "name">;
}

export type ProgramType = "Program Development" | "Akademik";

export interface Jadwal {
  id?: string;
  area: string;
  startDate: string;
  endDate: string;
}

export interface ProgramAO {
  userId: string;
  user?: Pick<User, "id" | "name" | "username">;
}

export interface Task {
  id: string;
  programId: string;
  name: string;
  deadline: string;
  notes: string | null;
  evidenceUrl: string | null;
  createdById: string;
  updatedAt: string | null;
  program?: Pick<Program, "id" | "name" | "type">;
  pics?: TaskPIC[];
  statuses?: TaskStatus[];
  approvals?: ApprovalLog[];
  createdBy?: Pick<User, "id" | "name">;
}

export interface TaskPIC {
  userId: string;
  user?: Pick<User, "id" | "name" | "username">;
}

export interface TaskStatus {
  id: string;
  taskId: string;
  userId: string;
  status: TaskStatusValue;
  notes: string | null;
  isPendingApproval: boolean;
  isApproved: boolean;
  rejectionNote: string | null;
  user?: Pick<User, "id" | "name" | "username">;
}

export type TaskStatusValue = "belum" | "berjalan" | "selesai";

export interface ApprovalLog {
  id: string;
  taskId: string;
  userId: string;
  action: "approve" | "reject";
  note: string | null;
  createdById: string;
  createdAt: string;
  task?: Pick<Task, "id" | "name">;
  user?: Pick<User, "id" | "name">;
  createdBy?: Pick<User, "id" | "name">;
}

export interface NavigationTab {
  id: string;
  label: string;
  icon: string;
}