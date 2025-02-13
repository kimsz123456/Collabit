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

      const returnTo = sessionStorage.getItem("returnTo");
      console.log(returnTo);

      if (auth.isAuthenticated) {
        if (returnTo) {
          router.push(returnTo);
        } else {
          router.push("/");
        }
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
