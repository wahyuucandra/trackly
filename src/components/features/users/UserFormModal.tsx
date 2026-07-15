"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { MultiSelect } from "@/components/ui/multiselect";
import { RoleSelect } from "@/components/features/users/RoleSelect";
import { UserPlus } from "lucide-react";
import type { User as UserType } from "@/types";

interface UserFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editUser: UserType | null;
  formData: { username: string; name: string; password: string; role: string };
  setFormData: React.Dispatch<React.SetStateAction<{ username: string; name: string; password: string; role: string }>>;
  selectedAreas: string[];
  setSelectedAreas: React.Dispatch<React.SetStateAction<string[]>>;
  perms: { dashboard: boolean; tasks: boolean; programs: boolean; approvals: boolean; export: boolean; users: boolean };
  setPerms: React.Dispatch<React.SetStateAction<{ dashboard: boolean; tasks: boolean; programs: boolean; approvals: boolean; export: boolean; users: boolean }>>;
  setRole: (role: string) => void;
  generateUsername: (name: string) => string;
  allAreas: string[];
  areaMap: Map<string, string>;
  onSave: () => void;
  isPending: boolean;
}

export function UserFormModal({
  open,
  onOpenChange,
  editUser,
  formData,
  setFormData,
  selectedAreas,
  setSelectedAreas,
  perms,
  setPerms,
  setRole,
  generateUsername,
  allAreas,
  areaMap,
  onSave,
  isPending,
}: UserFormModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <div className="space-y-3">
            {/* Nama */}
            <div>
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
            {/* Username + Password side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Username</label>
                <Input value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} placeholder="Auto-generated dari nama" disabled className="mt-1.5" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password {editUser ? "(opsional)" : ""}</label>
                <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Password" className="mt-1.5" />
              </div>
            </div>
            {/* Role */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</label>
              <RoleSelect value={formData.role} onChange={(v) => setRole(v)} />
            </div>
            {/* Area — Admin auto semua area, hanya tampil untuk AO */}
            {formData.role !== "Admin" && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Area</label>
                <div className="border border-border rounded-md p-3 mt-1.5 min-h-[42px]">
                  <MultiSelect
                    label={selectedAreas.length === 0 ? "Pilih Area" : selectedAreas.length === 1 ? (areaMap.get(selectedAreas[0]) || selectedAreas[0]) : `${selectedAreas.length} area`}
                    options={allAreas}
                    optionLabels={areaMap}
                    selected={selectedAreas}
                    onChange={setSelectedAreas}
                    placeholder="Cari area..."
                  />
                  {selectedAreas.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {selectedAreas.map((area) => (
                        <span key={area} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
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
            )}
          </div>

          {/* Akses Menu */}
          <AksesMenu formData={formData} perms={perms} setPerms={setPerms} />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-secondary/20 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="px-5">Batal</Button>
          <Button onClick={onSave} disabled={isPending} className="px-5">
            {editUser ? "Simpan Perubahan" : "Buat User"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AksesMenu({
  formData,
  perms,
  setPerms,
}: {
  formData: { role: string };
  perms: { dashboard: boolean; tasks: boolean; programs: boolean; approvals: boolean; export: boolean; users: boolean };
  setPerms: React.Dispatch<React.SetStateAction<{ dashboard: boolean; tasks: boolean; programs: boolean; approvals: boolean; export: boolean; users: boolean }>>;
}) {
  const isAdmin = formData.role === "Admin";

  const items: { key: keyof typeof perms; label: string; desc: string; locked: boolean }[] = [
    { key: "dashboard", label: "Dashboard", desc: "Ringkasan & statistik", locked: true },
    { key: "tasks", label: "Tugas", desc: "Lihat & update tugas", locked: isAdmin },
    { key: "programs", label: "Program", desc: "Kelola program", locked: !isAdmin },
    { key: "approvals", label: "Approval", desc: "Monitoring & Pengelolaan tugas", locked: !isAdmin },
    { key: "export", label: "Export", desc: "Download laporan", locked: !isAdmin },
    { key: "users", label: "Users", desc: "Kelola akun", locked: !isAdmin },
  ];

  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">Akses Menu</label>
      <div className="grid grid-cols-2 gap-3">
        {items.map(({ key, label, desc, locked }) => {
          const checked = perms[key];
          const isClickable = !locked && isAdmin;
          return (
            <div
              key={key}
              onClick={() => {
                if (!isClickable) return;
                setPerms({ ...perms, [key]: !checked });
              }}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                locked ? "cursor-not-allowed" : "cursor-pointer"
              } ${checked ? "bg-primary/5 border-primary/30" : locked && !isAdmin ? "border-border opacity-50" : "border-border hover:bg-secondary/50"}`}
            >
              <div>
                <p className="text-[13px] font-semibold">{label}</p>
                <p className="text-[11px] text-muted-foreground">{desc}</p>
              </div>
              <div className={`w-[38px] h-[22px] rounded-full relative transition-all ${checked ? "bg-primary" : "bg-slate-300"}`}>
                <div className="absolute w-[18px] h-[18px] rounded-full bg-white top-[2px] shadow-sm transition-all" style={{ left: checked ? "18px" : "2px" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}