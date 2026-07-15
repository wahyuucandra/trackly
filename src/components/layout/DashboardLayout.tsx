"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import type { NavigationTab } from "@/types";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const path = pathname.split("/")[1] || "dashboard";
    setActiveTab(path);
  }, [pathname]);

  const permissions = session?.user?.permissions;
  const role = session?.user?.role;

  const tabs: NavigationTab[] = [];
  if (permissions?.dashboard) tabs.push({ id: "dashboard", label: "Dashboard", icon: "home" });
  if (permissions?.tasks) tabs.push({ id: "tasks", label: "Tugas Saya", icon: "list" });
  if (permissions?.programs) tabs.push({ id: "programs", label: "Program", icon: "folder" });
  if (permissions?.approvals) tabs.push({ id: "approvals", label: "Verifikasi", icon: "check" });
  if (permissions?.export) tabs.push({ id: "export", label: "Export", icon: "download" });
  if (permissions?.users) tabs.push({ id: "users", label: "Users", icon: "users" });

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    if (id === "dashboard") {
      router.push("/");
    } else {
      router.push(`/${id}`);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7fb]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Topbar tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
      <main className="flex-1 p-5 md:p-8">{children}</main>
    </div>
  );
}