import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/services/api";
import type { User } from "@/types";

export function useUsersQuery() {
  const { data, isLoading } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: usersApi.getAll,
    staleTime: 5_000,
  });
  return { users: Array.isArray(data) ? data : [], isLoading };
}