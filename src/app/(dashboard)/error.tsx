"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-white p-10 rounded-[24px] border border-border text-center max-w-md shadow-lg">
        <AlertTriangle className="w-12 h-12 text-danger mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Terjadi Kesalahan</h2>
        <p className="text-muted mb-6 text-sm">
          {error.message || "Terjadi kesalahan yang tidak terduga. Silakan coba lagi."}
        </p>
        <Button onClick={reset} className="bg-gradient-to-r from-primary to-primary2">
          Coba Lagi
        </Button>
      </div>
    </div>
  );
}