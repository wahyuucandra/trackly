"use client";

import { useState, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useUserList, useUserMutations, useUserForm } from "@/hooks/useUsers";
import { useGcmList, useAreaMap } from "@/hooks/useGcm";
import { Button } from "@/components/ui/button";
import { UsersFilterBar } from "@/components/features/users/UsersFilterBar";
import { DeleteConfirmModal } from "@/components/features/users/DeleteConfirmModal";
import { UserFormModal } from "@/components/features/users/UserFormModal";
import { Pagination } from "@/components/ui/pagination";
import { VariantBadge } from "@/components/common";
import { UserPlus, Edit, Trash2 } from "lucide-react";
import type { User as UserType } from "@/types";

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  if (status === "loading") return null;

  const currentUser = session?.user;
  if (!currentUser || currentUser.role !== "Admin") {
    router.replace("/");
    return null;
  }

  const canManageUsers = currentUser.permissions?.users === true;

  return <UsersPageContent canManageUsers={canManageUsers} />;
}

function UsersPageContent({ canManageUsers }: { canManageUsers: boolean }) {
  const { users: allUsers, isLoading } = useUserList();
  const { gcm, isLoading: gcmLoading } = useGcmList();
  const areaMap = useAreaMap();
  const { createUser, updateUser, deleteUser } = useUserMutations();
  const { formData, setFormData, selectedAreas, setSelectedAreas, perms, setPerms, resetForm, fillForm, setRole, buildPayload, generateUsername } = useUserForm(allUsers);

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
  };

  // Close modal only on success
  useEffect(() => {
    if (createUser.isSuccess || updateUser.isSuccess) {
      setModalOpen(false);
      resetForm();
    }
  }, [createUser.isSuccess, updateUser.isSuccess]);

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

  if (isLoading || gcmLoading) return null;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground text-sm">Mengelola user</p>
        </div>
        {canManageUsers && (
          <Button onClick={openCreate} size="lg" className="gap-2 px-5">
            <UserPlus className="w-4 h-4" /> Tambah User
          </Button>
        )}
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
                      {canManageUsers && u.username !== "admin" ? (
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
                {canManageUsers && u.username !== "admin" && (
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
      <UserFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        editUser={editUser}
        formData={formData}
        setFormData={setFormData}
        selectedAreas={selectedAreas}
        setSelectedAreas={setSelectedAreas}
        perms={perms}
        setPerms={setPerms}
        setRole={setRole}
        generateUsername={generateUsername}
        allAreas={allAreas}
        areaMap={areaMap}
        onSave={handleSave}
        isPending={createUser.isPending || updateUser.isPending}
      />

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