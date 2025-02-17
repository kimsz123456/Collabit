import SignupSchema from "@/features/auth/types/SignupSchema";
import {
  checkEmailAPI,
  checkNicknameAPI,
  sendEmailCodeAPI,
  signupAPI,
  validateEmailCodeAPI,
} from "@/shared/api/auth";
import { useToast } from "@/shared/hooks/use-toast";
import useModalStore from "@/shared/lib/stores/modalStore";
import OneButtonModal from "@/widget/ui/modals/OneButtonModal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/shallow";

const useSignup = () => {
  const router = useRouter();
  const { toast } = useToast();

  // 폼 단계 상태
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { openModal, closeModal } = useModalStore(useShallow((state) => state));

  // 회원가입 폼 생성
  const form = useForm<z.infer<typeof SignupSchema>>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      email: "",
      code: "",
      password: "",
      passwordConfirm: "",
      nickname: "",
    },
  });

  // 1단계 인증번호 발송 함수
  const handleSendCode = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // 이메일 필드 검증 실행
    const isEmailValid = await form.trigger("email");
    const emailValue = form.getValues("email");
    const emailError = form.getFieldState("email").error;
    if (!isEmailValid || !emailValue || emailError) {
      toast({
        title: emailError?.message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await checkEmailAPI(emailValue);
    } catch {
      toast({
        title: "이미 가입된 이메일 입니다.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    try {
      await sendEmailCodeAPI(emailValue);
      toast({
        title: "인증번호 발송",
        description: "인증번호는 5분 후 만료됩니다.",
      });
      setStep(2);
    } catch (error) {
      toast({
        title: "인증번호 발송 실패",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 2단계 인증번호 검증 함수
  const handleValidCode = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const emailValue = form.getValues("email");
    // 인증번호 검증 로직 실행
    const isCodeValid = await form.trigger("code");
    const codeValue = form.getValues("code");
    const codeError = form.getFieldState("code").error;
    if (!isCodeValid || !codeValue || codeError) {
      toast({
        title: codeError?.message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await validateEmailCodeAPI({
        email: emailValue,
        code: codeValue,
      });
      setStep(3);
      toast({
        title: "인증 성공",
        description: "이메일 인증이 완료되었습니다.",
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

  // 3단계 비밀번호 검증 함수
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

    setStep(4);
  };

  // 4단계 닉네임 검증 함수
  const handleValidNickname = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    // 닉네임 검증 로직 실행
    const isNicknameValid = await form.trigger("nickname");
    const nicknameValue = form.getValues("nickname");
    const nicknameError = form.getFieldState("nickname").error;
    if (!isNicknameValid || !nicknameValue || nicknameError) {
      toast({
        title: nicknameError?.message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await checkNicknameAPI(nicknameValue);
      // submit 상태 대신 직접 모달 열기
      openModal(
        <OneButtonModal
          title="사용 가능한 닉네임"
          description="회원가입을 진행하시겠습니까?"
          buttonText="가입하기"
          handleButtonClick={() => {
            onSubmit(form.getValues());
            closeModal();
          }}
        />,
      );
    } catch (error) {
      toast({
        title: "닉네임 중복 확인 실패",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 회원가입 폼 제출 함수
  const onSubmit = async (data: z.infer<typeof SignupSchema>) => {
    console.log("onSubmit 호출");
    if (isLoading) return;
    setIsLoading(true);
    try {
      const requestData = {
        email: data.email,
        password: data.password,
        nickname: data.nickname,
      };
      await signupAPI(requestData);
      console.log("회원가입 성공");

      openModal(
        <OneButtonModal
          title="회원가입 성공"
          description="회원가입이 완료되었습니다."
          buttonText="로그인"
          handleButtonClick={() => {
            closeModal();
            setIsLoading(false);
            router.push("/login/credential");
          }}
        />,
      );
    } catch (error) {
      // toast({
      //   title: "회원가입 실패",
      //   description: (error as Error).message,
      //   variant: "destructive",
      // });
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
    handleSendCode,
    handleValidCode,
    handleValidPassword,
    handleValidNickname,
    onSubmit,
    handleBack,
    isLoading,
  };
};
export default useSignup;
