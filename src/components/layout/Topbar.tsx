"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BarChart3, LogOut, Menu, X } from "lucide-react";
import type { NavigationTab } from "@/types";

interface TopbarProps {
  tabs: NavigationTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function Topbar({ tabs, activeTab, onTabChange }: TopbarProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  const handleTabClick = (id: string) => {
    onTabChange(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-border shadow-sm">
      <div className="flex items-center justify-between px-4 md:px-8 h-16">
        {/* Logo — always visible */}
        <div className="flex items-center gap-2 shrink-0">
          <BarChart3 className="w-6 h-6 text-primary" strokeWidth={2.5} />
          <span className="text-xl font-extrabold text-[#1e3a8a] tracking-tight">TRACKLY</span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2.5 rounded-[14px] text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-sm"
                  : "bg-secondary text-secondary-foreground hover:bg-[#e2e8f0]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          <span className="text-sm font-medium">{user?.name}</span>
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
            user?.role === "Admin" ? "bg-blue-100 text-[#1d4ed8]" : "bg-emerald-100 text-emerald-700"
          }`}>
            {user?.role}
          </span>
          <button
            onClick={handleLogout}
            className="px-3 py-2 rounded-[14px] bg-warning hover:bg-amber-600 text-white text-sm font-bold transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>

        {/* Mobile hamburger only */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 py-4 animate-slide-down">
          {/* User info */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">{user?.name?.charAt(0) || "U"}</span>
            </div>
            <div>
              <p className="text-sm font-semibold">{user?.name}</p>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                user?.role === "Admin" ? "bg-blue-100 text-[#1d4ed8]" : "bg-emerald-100 text-emerald-700"
              }`}>{user?.role}</span>
            </div>
          </div>

          {/* Nav tabs */}
          <div className="flex flex-col gap-1 mb-3">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => handleTabClick(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-[14px] text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-primary to-[#1d4ed8] text-white"
                    : "text-secondary-foreground hover:bg-secondary"
                }`}>{tab.label}</button>
            ))}
          </div>

          {/* Logout di bawah */}
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 rounded-[14px] bg-warning hover:bg-amber-600 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      )}
    </header>
  );
}