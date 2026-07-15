"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { BarChart3 } from "lucide-react";

type Slice = { name: string; value: number; color: string };

export function ProgramChart({ title, slices }: { title: string; slices: Slice[] }) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const isEmpty = total === 0;

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-5">{title}</h3>
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <BarChart3 className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">Tidak ada data bulan ini</p>
            <p className="text-xs mt-1 opacity-60">Data program akan muncul setelah ada penjadwalan</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-[220px] h-[220px] md:w-[240px] md:h-[240px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={slices}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {slices.map((s, i) => (
                      <Cell key={i} fill={s.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 16px rgba(0,0,0,.06)",
                      fontSize: 13,
                    }}
                    formatter={(value) => [`${value} program`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2.5 w-full">
              {slices.map((s) => (
                <div key={s.name} className="flex items-center justify-between bg-secondary rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-block w-3.5 h-3.5 rounded-md" style={{ background: s.color }} />
                    <span className="text-sm font-medium">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-bold">{s.value}</span>
                    <span className="text-xs text-muted-foreground">program</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}