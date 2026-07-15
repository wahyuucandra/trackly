"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { api } from "@/lib/axios";

export interface MstGcm {
  id: string;
  condition: string;
  cd_value: string;
  desc_value: string;
  flag_active: boolean;
  createdAt: string;
}

export function useGcmList() {
  const { data, isLoading } = useQuery<MstGcm[]>({
    queryKey: ["gcm"],
    queryFn: () => api.get("/gcm").then((r) => r.data),
    staleTime: 60_000,
  });
  return { gcm: Array.isArray(data) ? data : [], isLoading };
}

/** Map cd_value → desc_value for displaying area names */
export function useAreaMap() {
  const { gcm } = useGcmList();
  return useMemo(() => {
    const map = new Map<string, string>();
    for (const g of gcm) {
      map.set(g.cd_value, g.desc_value);
    }
    return map;
  }, [gcm]);
}