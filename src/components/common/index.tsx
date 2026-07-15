import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, Clock, Play, AlertTriangle } from "lucide-react";

type BadgeVariant = "blue" | "green" | "red" | "amber" | "gray" | "purple";

const variantStyles: Record<BadgeVariant, string> = {
  blue: "bg-blue-50 text-blue-700",
  green: "bg-green-50 text-green-700",
  red: "bg-red-50 text-red-700",
  amber: "bg-amber-50 text-amber-700",
  gray: "bg-slate-100 text-slate-600",
  purple: "bg-purple-50 text-purple-700",
};

export function VariantBadge({ variant, children, className }: { variant: BadgeVariant; children: React.ReactNode; className?: string }) {
  return <Badge variant="secondary" className={cn("font-semibold px-3 py-1 text-sm rounded-full", variantStyles[variant], className)}>{children}</Badge>;
}

export function StatusBadge({ status, isApproved }: { status: string; isApproved?: boolean }) {
  if (isApproved) return <Badge variant="secondary" className="bg-green-50 text-green-700 font-semibold px-3 py-1 text-sm rounded-full"><Check className="w-3 h-3 mr-1" /> Terverifikasi</Badge>;
  if (status === "selesai") return <Badge variant="secondary" className="bg-purple-50 text-purple-700 font-semibold px-3 py-1 text-sm rounded-full"><Clock className="w-3 h-3 mr-1" /> Menunggu</Badge>;
  if (status === "berjalan") return <Badge variant="secondary" className="bg-blue-50 text-blue-700 font-semibold px-3 py-1 text-sm rounded-full"><Play className="w-3 h-3 mr-1" /> Berjalan</Badge>;
  return <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-semibold px-3 py-1 text-sm rounded-full">Belum</Badge>;
}

export function DeadlineBadge({ deadline }: { deadline: string }) {
  if (!deadline) return null;
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
  if (diff < 0) return <Badge variant="secondary" className="bg-red-50 text-red-700 font-semibold px-3 py-1 text-sm rounded-full"><AlertTriangle className="w-3 h-3 mr-1" /> Lewat {Math.abs(diff)}h</Badge>;
  if (diff <= 7) return <Badge variant="secondary" className="bg-amber-50 text-amber-700 font-semibold px-3 py-1 text-sm rounded-full"><Clock className="w-3 h-3 mr-1" /> {diff} hari</Badge>;
  return <span className="text-sm text-muted-foreground">{new Date(deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>;
}

export function EmptyState({ icon, title, description }: { icon?: React.ReactNode; title: string; description?: string }) {
  return (
    <div className="bg-card p-12 rounded-2xl text-center border border-border">
      {icon && <div className="text-4xl mb-4 flex justify-center">{icon}</div>}
      <p className="font-semibold text-lg mb-1">{title}</p>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  );
}