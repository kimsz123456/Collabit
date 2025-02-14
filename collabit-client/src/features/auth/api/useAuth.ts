import { logoutAPI } from "@/shared/api/auth";
import { getUserInfoAPI } from "@/shared/api/user";
import { UserInfoResponse } from "@/shared/types/response/user";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data, isLoading, isError } = useQuery<UserInfoResponse>({
    queryKey: ["auth"],
    queryFn: getUserInfoAPI,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 12,
    retry: false,
  });

  const logout = async () => {
    try {
      await logoutAPI();
      queryClient.setQueryData(["auth"], {
        userInfo: undefined,
        isAuthenticated: false,
      });
      document.cookie =
        "lastPath=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  return {
    userInfo: data?.userInfo,
    isAuthenticated: data?.isAuthenticated ?? false,
    isLoading,
    isError,
    logout,
  };
};
