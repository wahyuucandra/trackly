"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Shield, User } from "lucide-react";

const ROLES = [
  { value: "Admin", label: "Admin", desc: "Akses penuh semua menu", icon: Shield },
  { value: "AO", label: "AO", desc: "Dashboard & Tugas saja", icon: User },
] as const;

interface RoleSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function RoleSelect({ value, onChange }: RoleSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = ROLES.find((r) => r.value === value) ?? ROLES[1];
  const Icon = selected.icon;

  return (
    <div ref={ref} className="relative mt-1.5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none hover:bg-secondary/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{selected.label}</span>
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover p-1 shadow-lg animate-in fade-in-0 zoom-in-95">
          {ROLES.map((role) => {
            const isActive = role.value === value;
            const RoleIcon = role.icon;
            return (
              <button
                key={role.value}
                type="button"
                onClick={() => {
                  onChange(role.value);
                  setOpen(false);
                }}
                className={`flex items-center gap-3 w-full rounded-md px-3 py-2.5 text-sm transition-colors text-left ${
                  isActive ? "bg-primary/10 text-primary font-semibold" : "hover:bg-secondary"
                }`}
              >
                <RoleIcon className={`w-4 h-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{role.label}</p>
                  <p className="text-[11px] text-muted-foreground">{role.desc}</p>
                </div>
                {isActive && <Check className="w-4 h-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}