import { useQuery } from "@tanstack/react-query";
import { programsApi } from "@/services/api";
import type { Program } from "@/types";

export function useProgramsQuery() {
  const { data: programs, isLoading } = useQuery<Program[]>({
    queryKey: ["programs"],
    queryFn: programsApi.getAll,
    staleTime: 5_000,
  });
  return { programs: Array.isArray(programs) ? programs : [], isLoading };
}