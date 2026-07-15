import { format, differenceInDays, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { AO_COLORS } from "@/constants";

export function formatDate(d: string | null | undefined): string {
  if (!d) return "-";
  try {
    return format(parseISO(d), "d MMM yyyy", { locale: id });
  } catch {
    return "-";
  }
}

export function today(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function daysDiff(d: string): number | null {
  if (!d) return null;
  try {
    return differenceInDays(parseISO(d), new Date());
  } catch {
    return null;
  }
}

export function genId(): string {
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function getAOColor(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = ((hash << 5) - hash) + username.charCodeAt(i);
    hash |= 0;
  }
  return AO_COLORS[Math.abs(hash) % AO_COLORS.length];
}

export function linkify(text: string): string {
  if (!text) return "";
  return text.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">$1</a>'
  );
}

export function formatAOs(aoNames: string[]): string {
  return aoNames.join(", ");
}

export function formatJadwal(jadwal: { area: string; startDate?: string; endDate?: string }[]): string {
  return jadwal
    .map((j) =>
      j.startDate && j.endDate ? `${j.area}: ${formatDate(j.startDate)} - ${formatDate(j.endDate)}` : j.area
    )
    .join(" · ");
}