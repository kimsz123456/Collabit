import PasswordChangeSchema from "@/features/auth/types/PasswordChangeSchema";
import SignupSchema from "@/features/auth/types/SignupSchema";
import { checkUserPasswordAPI, updateUserPasswordAPI } from "@/shared/api/user";
import { useToast } from "@/shared/hooks/use-toast";
import useModalStore from "@/shared/lib/stores/modalStore";
import OneButtonModal from "@/widget/ui/modals/OneButtonModal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const usePasswordChange = () => {
  const router = useRouter();
  const { toast } = useToast();

  // 폼 단계 상태
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { openModal, closeModal } = useModalStore();

  // 회원가입 폼 생성
  const form = useForm<z.infer<typeof SignupSchema>>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      password: "",
      passwordConfirm: "",
    },
  });

  // 1단계 현재 비밀번호 검증 함수
  const handleCurrentPassword = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();

    // 비밀번호 검증 로직 실행
    const isPasswordValid = await form.trigger("password");
    const passwordValue = form.getValues("password");
    const passwordError = form.getFieldState("password").error;
    if (!isPasswordValid || !passwordValue || passwordError) {
      toast({
        title: passwordError?.message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await checkUserPasswordAPI({
        currentPassword: passwordValue,
      });
      setStep(2);
      toast({
        title: "인증 성공",
        description: "비밀번호 인증이 완료되었습니다.",
      });
    } catch (error) {
      toast({
        title: "인증 실패",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      form.resetField("code");
    }
  };

  // 2단계 바꿀 비밀번호 검증 함수
  const handleValidPassword = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();

    // 비밀번호 검증 로직 실행
    const isPasswordValid = await form.trigger("password");
    const passwordValue = form.getValues("password");
    const passwordError = form.getFieldState("password").error;
    if (!isPasswordValid || !passwordValue || passwordError) {
      toast({
        title: passwordError?.message,
        variant: "destructive",
      });
      return;
    }

    // 비밀번호 확인 검증 로직 실행
    const isPasswordConfirmValid = await form.trigger("passwordConfirm");
    const passwordConfirmValue = form.getValues("passwordConfirm");
    const passwordConfirmError = form.getFieldState("passwordConfirm").error;
    if (
      !isPasswordConfirmValid ||
      !passwordConfirmValue ||
      passwordConfirmError
    ) {
      toast({
        title: passwordConfirmError?.message,
        variant: "destructive",
      });
      return;
    }
    openModal(
      <OneButtonModal
        title="비밀번호 변경"
        description="비밀번호를 변경하시겠습니까?"
        buttonText="변경"
        handleButtonClick={() => {
          onSubmit(form.getValues());
        }}
      />,
    );
  };

  // 비밀번호 변경 폼 제출 함수
  const onSubmit = async (data: z.infer<typeof PasswordChangeSchema>) => {
    setIsLoading(true);
    try {
      const requestData = {
        newPassword: data.password,
      };
      await updateUserPasswordAPI(requestData);
      openModal(
        <OneButtonModal
          title="비밀번호 변경 성공"
          description="비밀번호 변경이 완료되었습니다."
          buttonText="확인"
          handleButtonClick={() => {
            router.push("/mypage/profile");
            closeModal();
          }}
        />,
      );
      form.reset();
      router.push("/mypage/profile");
    } catch (error) {
      toast({
        title: "비밀번호 변경 실패",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 1) {
      router.push("/login/credential");
    } else if (step === 3) {
      setStep(1);
    } else {
      setStep(step - 1);
    }
  };

  return {
    form,
    step,
    handleCurrentPassword,
    handleValidPassword,
    onSubmit,
    handleBack,
    isLoading,
  };
};

export default usePasswordChange;
