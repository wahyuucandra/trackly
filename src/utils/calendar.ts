import { genId } from "@/utils/formatters";

export function generateCalendar(
  month: number,
  year: number,
  tasks: { deadline: string; name: string; isApproved: boolean }[]
) {
  const now = new Date();
  const todayStr = formatDateStr(now);
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const taskMap: Record<string, typeof tasks> = {};
  tasks.forEach((t) => {
    if (t.deadline) {
      if (!taskMap[t.deadline]) taskMap[t.deadline] = [];
      taskMap[t.deadline].push(t);
    }
  });

  const days: CalendarDay[] = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ day: daysInPrev - i, month: "prev", dateStr: "" });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push({
      day: d,
      month: "current",
      dateStr,
      isToday: dateStr === todayStr,
      hasTask: !!taskMap[dateStr],
      isApproved: taskMap[dateStr] ? taskMap[dateStr].every((t) => t.isApproved) : false,
      taskCount: taskMap[dateStr]?.length ?? 0,
    });
  }
  const remaining = (7 - (days.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    days.push({ day: d, month: "next", dateStr: "" });
  }

  return { days, taskMap };
}

export interface CalendarDay {
  day: number;
  month: "prev" | "current" | "next";
  dateStr: string;
  isToday?: boolean;
  hasTask?: boolean;
  isApproved?: boolean;
  taskCount?: number;
}

function formatDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function getCalendarTasks(
  dateStr: string,
  tasks: { deadline: string; name: string; programName: string; isApproved: boolean }[]
) {
  return tasks.filter((t) => t.deadline === dateStr);
}