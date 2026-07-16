"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Clock, Hourglass } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarTask {
  deadline: string;
  name: string;
  programName: string;
  status: "belum" | "berjalan" | "menunggu" | "selesai";
}

interface CalendarViewProps {
  tasks: CalendarTask[];
}

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const DOW = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const STATUS_COLORS = {
  belum: { bg: "bg-red-500", text: "text-red-500", ring: "ring-red-500", light: "bg-red-100 text-red-700" },
  berjalan: { bg: "bg-blue-500", text: "text-blue-500", ring: "ring-blue-500", light: "bg-blue-100 text-blue-700" },
  menunggu: { bg: "bg-amber-500", text: "text-amber-500", ring: "ring-amber-500", light: "bg-amber-100 text-amber-700" },
  selesai: { bg: "bg-emerald-500", text: "text-emerald-500", ring: "ring-emerald-500", light: "bg-emerald-100 text-emerald-700" },
};

export function CalendarView({ tasks }: CalendarViewProps) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Group tasks by date, compute dominant status per date
  const dateInfo = useMemo(() => {
    const map: Record<string, { tasks: CalendarTask[]; dominantStatus: "belum" | "berjalan" | "menunggu" | "selesai" | null; hasMultipleStatuses: boolean }> = {};
    tasks.forEach((t) => {
      if (!t.deadline) return;
      if (!map[t.deadline]) map[t.deadline] = { tasks: [], dominantStatus: null, hasMultipleStatuses: false };
      map[t.deadline].tasks.push(t);
    });
    for (const key of Object.keys(map)) {
      const statuses = map[key].tasks.map((t) => t.status);
      const unique = new Set(statuses);
      map[key].hasMultipleStatuses = unique.size > 1;
      // Priority: belum > menunggu > berjalan > selesai
      if (unique.has("belum")) map[key].dominantStatus = "belum";
      else if (unique.has("menunggu")) map[key].dominantStatus = "menunggu";
      else if (unique.has("berjalan")) map[key].dominantStatus = "berjalan";
      else map[key].dominantStatus = "selesai";
    }
    return map;
  }, [tasks]);

  const { days } = useMemo(() => {
    const todayStr = formatDateStr(now);
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();

    const result: CalendarDay[] = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      result.push({ day: daysInPrev - i, month: "prev", dateStr: "" });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      result.push({
        day: d,
        month: "current",
        dateStr,
        isToday: dateStr === todayStr,
      });
    }
    const remaining = (7 - (result.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      result.push({ day: d, month: "next", dateStr: "" });
    }
    return { days: result };
  }, [month, year]);

  const selectedDateInfo = selectedDate ? dateInfo[selectedDate] : null;

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else { setMonth((m) => m - 1); }
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else { setMonth((m) => m + 1); }
    setSelectedDate(null);
  };

  return (
    <div className="bg-card rounded-[20px] border border-border p-5 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-base">
          {MONTHS[month]} {year}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={prevMonth} className="h-7 w-7">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={nextMonth} className="h-7 w-7">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Day-of-week header */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {DOW.map((d) => (
          <div key={d} className="text-[11px] font-semibold text-muted-foreground uppercase py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const info = day.dateStr ? dateInfo[day.dateStr] : null;
          const hasTask = !!info;
          const status = info?.dominantStatus;
          const hasMultiple = info?.hasMultipleStatuses;
          const isToday = day.isToday;
          const isSelected = day.dateStr === selectedDate;
          const isOtherMonth = day.month !== "current";

          const color = status ? STATUS_COLORS[status] : null;

          return (
            <button
              key={i}
              type="button"
              disabled={isOtherMonth}
              onClick={() => {
                if (hasTask) setSelectedDate(day.dateStr || null);
              }}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-lg py-1.5 text-sm transition-all min-h-[44px]",
                isOtherMonth && "text-muted-foreground/30 cursor-default",
                !isOtherMonth && !hasTask && "hover:bg-secondary cursor-default",
                !isOtherMonth && hasTask && "cursor-pointer",
                isSelected && "bg-primary/10",
              )}
            >
              {isToday && !isSelected && (
                <span className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
              <span
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                  hasTask && !isSelected && color && `text-white ${color.bg}`,
                  hasTask && !isSelected && hasMultiple && "ring-2 ring-offset-1 ring-white",
                  hasTask && !isSelected && !color && "bg-primary/10 text-primary",
                  isToday && !hasTask && !isSelected && "ring-2 ring-primary/30 font-bold",
                  isSelected && "bg-primary text-primary-foreground font-bold",
                )}
              >
                {day.day}
              </span>
              {/* Multi-status indicator */}
              {hasTask && hasMultiple && !isSelected && (
                <div className="flex gap-0.5 mt-0.5">
                  {info.tasks.slice(0, 3).map((t, j) => (
                    <span
                      key={j}
                      className={cn("w-1.5 h-1.5 rounded-full", STATUS_COLORS[t.status]?.bg)}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-red-500" /> Deadline
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-blue-500" /> Berjalan
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-amber-500" /> Menunggu
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-emerald-500" /> Selesai
        </span>
      </div>

      {/* Selected date tasks */}
      {selectedDate && selectedDateInfo && selectedDateInfo.tasks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground mb-3">
            {new Date(selectedDate + "T00:00:00+07:00").toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "Asia/Jakarta",
            })}
          </p>
          <div className="space-y-2">
            {selectedDateInfo.tasks.map((t, i) => {
              const statusColor = STATUS_COLORS[t.status];
              const StatusIcon = t.status === "selesai" ? CheckCircle2 : t.status === "menunggu" ? Hourglass : t.status === "berjalan" ? Clock : Circle;
              const statusLabel = t.status === "selesai" ? "Selesai" : t.status === "menunggu" ? "Menunggu" : t.status === "berjalan" ? "Berjalan" : "Deadline";
              return (
                <div key={i} className={cn("flex items-center gap-3 p-2.5 rounded-xl", statusColor.light)}>
                  <StatusIcon className="w-4 h-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{t.name}</p>
                    <p className="text-xs opacity-70 truncate">{t.programName}</p>
                  </div>
                  <span className="text-[10px] font-semibold uppercase ml-auto shrink-0 opacity-60">
                    {statusLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedDate && (!selectedDateInfo || selectedDateInfo.tasks.length === 0) && (
        <div className="mt-4 pt-4 border-t border-border text-sm text-muted-foreground italic text-center py-4">
          Tidak ada tugas di tanggal ini
        </div>
      )}
    </div>
  );
}

interface CalendarDay {
  day: number;
  month: "prev" | "current" | "next";
  dateStr: string;
  isToday?: boolean;
}

function formatDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}