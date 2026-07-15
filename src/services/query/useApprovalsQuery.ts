import { useQuery } from "@tanstack/react-query";
import { approvalsApi } from "@/services/api";

export function useApprovalsQuery() {
  const { data, isLoading } = useQuery({
    queryKey: ["approvals"],
    queryFn: approvalsApi.getAll,
    staleTime: 5_000,
  });
  return { pending: data?.pending || [], history: data?.history || [], isLoading };
}