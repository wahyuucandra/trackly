"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PDODashboardView } from "@/components/features/dashboard/PDODashboardView";
import { AODashboardView } from "@/components/features/dashboard/AODashboardView";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") return null;
  if (!session?.user) return null;
  return session.user.role === "Admin" ? <PDODashboardView /> : <AODashboardView />;
}