"use client";

import { useState, useMemo } from "react";
import { useUserList, useUserMutations, useUserForm } from "@/hooks/useUsers";
import { useGcmList, useAreaMap } from "@/hooks/useGcm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UsersFilterBar } from "@/components/features/users/UsersFilterBar";
import { DeleteConfirmModal } from "@/components/features/users/DeleteConfirmModal";
import { Pagination } from "@/components/ui/pagination";
import { VariantBadge } from "@/components/common";
import { MultiSelect } from "@/components/ui/multiselect";
import { UserPlus, Edit, Trash2 } from "lucide-react";
import type { User as UserType } from "@/types";

export default function UsersPage() {
  const { users: allUsers } = useUserList();
  const { gcm } = useGcmList();
  const areaMap = useAreaMap();
  const { createUser, updateUser, deleteUser } = useUserMutations();
  const { formData, setFormData, selectedAreas, setSelectedAreas, perms, setPerms, resetForm, fillForm, buildPayload, generateUsername } = useUserForm(allUsers);

  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserType | null>(null);

  // Filters
  const [filterAreas, setFilterAreas] = useState<string[]>([]);
  const [filterRoles, setFilterRoles] = useState<string[]>([]);
  const [filterSearch, setFilterSearch] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // All areas from mst_gcm (active only) — using cd_value
  const allAreas = useMemo(
    () => gcm.filter((g) => g.flag_active).map((g) => g.cd_value),
    [gcm],
  );

  const filtered = useMemo(() => {
    let result = allUsers;
    if (filterAreas.length > 0) {
      result = result.filter((u) => (u.area || []).some((a) => filterAreas.includes(a)));
    }
    if (filterRoles.length > 0) {
      result = result.filter((u) => filterRoles.includes(u.role));
    }
    if (filterSearch) {
      const q = filterSearch.toLowerCase();
      result = result.filter((u) => u.name.toLowerCase().includes(q));
    }
    return result;
  }, [allUsers, filterAreas, filterRoles, filterSearch]);

  const total = filtered.length;
  const paged = filtered.slice((page - 1) * limit, page * limit);

  const handleFilterChange = (partial: { areas?: string[]; roles?: string[]; search?: string }) => {
    if (partial.areas !== undefined) setFilterAreas(partial.areas);
    if (partial.roles !== undefined) setFilterRoles(partial.roles);
    if (partial.search !== undefined) setFilterSearch(partial.search);
    setPage(1);
  };

  const handleReset = () => {
    setFilterAreas([]);
    setFilterRoles([]);
    setFilterSearch("");
    setPage(1);
  };

  const handleSave = () => {
    if (!formData.username || !formData.name) return;
    const payload = buildPayload();
    if (editUser) {
      updateUser.mutate({ id: editUser.id, data: payload });
    } else {
      createUser.mutate(payload);
    }
    setModalOpen(false);
  };

  const openCreate = () => {
    setEditUser(null);
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (u: UserType) => {
    setEditUser(u);
    fillForm(u);
    setModalOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground text-sm">Mengelola management user dan matrix uam</p>
        </div>
        <Button onClick={openCreate} size="lg" className="gap-2 px-5">
          <UserPlus className="w-4 h-4" /> Tambah User
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="mb-4">
        <UsersFilterBar
          areas={filterAreas}
          roles={filterRoles}
          search={filterSearch}
          allAreas={allAreas}
          areaMap={areaMap}
          onChange={handleFilterChange}
          onReset={handleReset}
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm">
        {/* Desktop */}
        <div className="hidden md:block overflow-y-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary/50 sticky top-0 z-10">
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-left">Username</th>
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-left">Nama</th>
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-left">Role</th>
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-left">Area</th>
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-left">Akses</th>
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right" />
              </tr>
            </thead>
            <tbody>
              {paged.map((u) => {
                const p = u.permissions as Record<string, boolean>;
                return (
                  <tr key={u.id} className="border-t border-border hover:bg-secondary/30 transition-colors">
                    <td className="p-4 font-semibold">{u.username}</td>
                    <td className="p-4">{u.name}</td>
                    <td className="p-4">
                      <VariantBadge variant={u.role === "Admin" ? "purple" : "blue"}>{u.role}</VariantBadge>
                    </td>
                    <td className="p-4 text-muted-foreground">{(u.area || []).map((a) => areaMap.get(a) || a).join(", ") || "-"}</td>
                    <td className="p-4 text-muted-foreground">
                      {Object.entries(p || {}).filter(([, v]) => v).map(([k]) => k).join(", ") || "-"}
                    </td>
                    <td className="p-4 text-right">
                      {u.username !== "admin" ? (
                        <div className="flex gap-1.5 justify-end">
                          <Button variant="outline" size="sm" onClick={() => openEdit(u)} className="px-3">
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(u)} className="px-3">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!paged.length && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground">Tidak ada user</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-border max-h-[520px] overflow-y-auto">
          {paged.map((u) => {
            const p = u.permissions as Record<string, boolean>;
            return (
              <div key={u.id} className="p-4 hover:bg-secondary/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold">{u.name}</p>
                    <p className="text-sm text-muted-foreground">@{u.username}</p>
                  </div>
                  <VariantBadge variant={u.role === "Admin" ? "purple" : "blue"}>{u.role}</VariantBadge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Area: {(u.area || []).map((a) => areaMap.get(a) || a).join(", ") || "-"}</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Akses: {Object.entries(p || {}).filter(([, v]) => v).map(([k]) => k).join(", ") || "-"}
                </p>
                {u.username !== "admin" && (
                  <div className="flex gap-1.5">
                    <Button variant="outline" size="sm" onClick={() => openEdit(u)} className="gap-1.5 px-3">
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(u)} className="gap-1.5 px-3">
                      <Trash2 className="w-3.5 h-3.5" /> Hapus
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
          {!paged.length && (
            <div className="p-12 text-center text-muted-foreground">Tidak ada user</div>
          )}
        </div>

        {total > 0 && (
          <Pagination page={page} limit={limit} total={total} onPageChange={setPage} onLimitChange={setLimit} />
        )}
      </div>

      {/* User Form Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:min-w-[550px] p-0 gap-0 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-border bg-secondary/30">
            <DialogTitle className="text-lg flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10">
                <UserPlus className="w-5 h-5 text-primary" />
              </div>
              {editUser ? "Edit User" : "Tambah User Baru"}
            </DialogTitle>
          </div>

          {/* Content */}
          <div className="px-6 py-5 space-y-4">
            <div className="flex flex-col gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nama Lengkap</label>
                <Input
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData({ ...formData, name });
                    if (!editUser) {
                      setFormData((prev) => ({ ...prev, username: generateUsername(name), name }));
                    }
                  }}
                  placeholder="Nama lengkap"
                  className="mt-1.5"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Username</label>
                <Input value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} placeholder="Auto-generated dari nama" disabled className="mt-1.5" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password {editUser ? "(opsional)" : ""}</label>
                <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="password" className="mt-1.5" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</label>
                <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v ?? "AO" })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AO">AO</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">Area</label>
                <div className="border border-border rounded-xl p-3">
                  <MultiSelect
                    label={selectedAreas.length === 0 ? "Pilih Area" : selectedAreas.length === 1 ? (areaMap.get(selectedAreas[0]) || selectedAreas[0]) : `${selectedAreas.length} area`}
                    options={allAreas}
                    optionLabels={areaMap}
                    selected={selectedAreas}
                    onChange={setSelectedAreas}
                    placeholder="Cari area..."
                  />
                  {selectedAreas.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {selectedAreas.map((area) => (
                        <span key={area} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          {areaMap.get(area) || area}
                          <button
                            onClick={() => setSelectedAreas((prev) => prev.filter((a) => a !== area))}
                            className="ml-0.5 hover:text-red-500 transition-colors"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">Akses Menu</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "tasks", label: "Tugas", desc: "Lihat & update tugas" },
                  { key: "programs", label: "Program", desc: "Kelola program" },
                  { key: "approvals", label: "Verifikasi", desc: "Setujui / tolak" },
                  { key: "export", label: "Export", desc: "Download laporan" },
                  { key: "users", label: "Users", desc: "Kelola akun" },
                ].map(({ key, label, desc }) => (
                  <div
                    key={key}
                    onClick={() => setPerms({ ...perms, [key]: !(perms as Record<string, boolean>)[key] })}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      (perms as Record<string, boolean>)[key] ? "bg-primary/5 border-primary/30" : "border-border hover:bg-secondary/50"
                    }`}
                  >
                    <div>
                      <p className="text-[13px] font-semibold">{label}</p>
                      <p className="text-[11px] text-muted-foreground">{desc}</p>
                    </div>
                    <div className={`w-[38px] h-[22px] rounded-full relative transition-all ${(perms as Record<string, boolean>)[key] ? "bg-primary" : "bg-slate-300"}`}>
                      <div className="absolute w-[18px] h-[18px] rounded-full bg-white top-[2px] shadow-sm transition-all" style={{ left: (perms as Record<string, boolean>)[key] ? "18px" : "2px" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border bg-secondary/20 flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="px-5">Batal</Button>
            <Button onClick={handleSave} disabled={createUser.isPending || updateUser.isPending} className="px-5">
              {editUser ? "Simpan Perubahan" : "Buat User"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        open={!!deleteTarget}
        username={deleteTarget?.name || ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteUser.mutate(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        isPending={deleteUser.isPending}
      />
    </div>
  );
}