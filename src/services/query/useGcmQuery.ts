import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { gcmApi } from "@/services/api";

export function useGcmQuery() {
  const { data, isLoading } = useQuery({
    queryKey: ["gcm"],
    queryFn: gcmApi.getAll,
    staleTime: 60_000,
  });
  return { gcm: Array.isArray(data) ? data : [], isLoading };
}

export function useAreaMap() {
  const { gcm } = useGcmQuery();
  return useMemo(() => {
    const map = new Map<string, string>();
    (gcm as { cd_value: string; desc_value: string }[]).forEach((g) => {
      map.set(g.cd_value, g.desc_value);
    });
    return map;
  }, [gcm]);
}