"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import type { User as UserType } from "@/types";

export function useUserList() {
  const { data, isLoading } = useQuery<UserType[]>({
    queryKey: ["users"],
    queryFn: () => api.get("/users").then((r) => r.data),
    staleTime: 30_000,
  });
  return { users: Array.isArray(data) ? data : [], isLoading };
}

export function useUserMutations() {
  const queryClient = useQueryClient();

  const createUser = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/users", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User berhasil dibuat");
    },
    onError: (err: { response?: { data?: { error?: string } } }) => {
      toast.error(err?.response?.data?.error || "Gagal membuat user");
    },
  });

  const updateUser = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.patch(`/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User berhasil diupdate");
    },
    onError: (err: { response?: { data?: { error?: string } } }) => {
      toast.error(err?.response?.data?.error || "Gagal mengupdate user");
    },
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User berhasil dihapus");
    },
  });

  return { createUser, updateUser, deleteUser };
}

export function useUserForm(users: UserType[]) {
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
    setPerms({ dashboard: true, tasks: false, programs: false, approvals: false, export: false, users: false });
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
    area: selectedAreas,
    permissions: perms,
  });

  return { formData, setFormData, selectedAreas, setSelectedAreas, perms, setPerms, resetForm, fillForm, buildPayload, generateUsername };
}