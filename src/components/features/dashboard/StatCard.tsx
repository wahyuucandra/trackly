import type { LucideIcon } from "lucide-react";

type Accent = "blue" | "emerald" | "amber" | "slate";

const styles: Record<Accent, { bg: string; text: string }> = {
  blue:    { bg: "bg-blue-50 text-blue-600", text: "text-blue-600" },
  emerald: { bg: "bg-emerald-50 text-emerald-600", text: "text-emerald-600" },
  amber:   { bg: "bg-amber-50 text-amber-600", text: "text-amber-600" },
  slate:   { bg: "bg-slate-100 text-slate-600", text: "text-slate-600" },
};

export function StatCard({ icon: Icon, label, value, accent }: { icon: LucideIcon; label: string; value: number; accent: Accent }) {
  const s = styles[accent];
  return (
    <div className="bg-card p-6 rounded-[24px] border border-border shadow-[0_10px_30px_rgba(15,23,42,.06)] text-center hover:shadow-md transition-shadow">
      <p className="text-[13px] text-muted-foreground mb-2 uppercase font-bold tracking-wider">{label}</p>
      <p className="text-[38px] font-extrabold">{value}</p>
    </div>
  );
}