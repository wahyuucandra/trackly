"use client";

import { useState } from "react";
import type { User as UserType } from "@/types";

// Re-export from services
export { useUsersQuery as useUserList } from "@/services/query";
export { useUsersMutation as useUserMutations } from "@/services/mutation";

export function useUserForm(users: UserType[], allAreas: string[] = []) {
  const [formData, setFormData] = useState({
    username: "", name: "", password: "", role: "AO",
  });
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [perms, setPerms] = useState({
    dashboard: true, tasks: false, programs: false, approvals: false, export: false, users: false,
  });

  const resetForm = () => {
    setFormData({ username: "", name: "", password: "", role: "AO" });
    setSelectedAreas([]);
    setPerms({ dashboard: true, tasks: true, programs: false, approvals: false, export: false, users: false });
  };

  const fillForm = (user: UserType) => {
    const p = user.permissions as Record<string, boolean>;
    setFormData({
      username: user.username, name: user.name, password: "", role: user.role,
    });
    setSelectedAreas(user.area || []);
    setPerms({
      dashboard: p?.dashboard ?? true, tasks: p?.tasks ?? false,
      programs: p?.programs ?? false, approvals: p?.approvals ?? false,
      export: p?.export ?? false, users: p?.users ?? false,
    });
  };

  /** Set role and auto-adjust permissions */
  const setRole = (role: string) => {
    setFormData((prev) => ({ ...prev, role }));
    if (role === "AO") {
      setPerms({ dashboard: true, tasks: true, programs: false, approvals: false, export: false, users: false });
    } else {
      // Admin: tasks disabled (monitor via approval), dashboard always on, all areas auto
      setPerms({ dashboard: true, tasks: false, programs: false, approvals: false, export: false, users: false });
      setSelectedAreas([]);
    }
  };

  /** Auto-generate username from name: lowercase, no spaces, no special chars, unique */
  const generateUsername = (name: string): string => {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .replace(/\s+/g, "");
    if (!base) return "";
    let candidate = base;
    let counter = 1;
    const existing = new Set(users.map((u) => u.username));
    while (existing.has(candidate)) {
      candidate = `${base}${counter}`;
      counter++;
    }
    return candidate;
  };

  const buildPayload = () => ({
    username: formData.username,
    name: formData.name,
    password: formData.password || undefined,
    role: formData.role,
    area: formData.role === "Admin" ? allAreas : selectedAreas,
    permissions: perms,
  });

  return { formData, setFormData, selectedAreas, setSelectedAreas, perms, setPerms, resetForm, fillForm, setRole, buildPayload, generateUsername };
}