import { getUserInfoAPI } from "@/shared/api/user";
import useModalStore from "@/shared/lib/stores/modalStore";
import OneButtonModal from "@/widget/ui/modals/OneButtonModal";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const useLoginCallback = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { openModal, closeModal } = useModalStore();

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await queryClient.fetchQuery({
        queryKey: ["auth"],
        queryFn: getUserInfoAPI,
      });

      const cookies = document.cookie.split(";");
      const lastPathCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("lastPath="),
      );
      const returnTo = lastPathCookie
        ? decodeURIComponent(lastPathCookie.split("=")[1])
        : null;

      if (auth.isAuthenticated) {
        if (returnTo) {
          if (returnTo.includes("callback")) {
            router.push("/");
          } else {
            router.push(returnTo);
          }
        } else {
          router.push("/");
        }

        document.cookie =
          "lastPath=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      } else {
        openModal(
          <OneButtonModal
            title="로그인 실패"
            description="로그인에 실패했습니다."
            buttonText="확인"
            handleButtonClick={() => {
              router.push("/login");
              closeModal();
            }}
          />,
        );
      }
    };
    checkAuth();
  }, [openModal, closeModal, queryClient, router]);
};
export default useLoginCallback;
