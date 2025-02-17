"use client";
import useSignup from "@/features/auth/api/useSignup";
import { Button } from "@/shared/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/shared/ui/input-otp";
import { Progress } from "@/shared/ui/progress";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { ArrowLeftIcon, Loader2 } from "lucide-react";

// 회원가입 폼 스키마

export default function Page() {
  const {
    form,
    step,
    isLoading,
    handleSendCode,
    handleValidCode,
    handleValidPassword,
    handleValidNickname,
    handleBack,
  } = useSignup();
  return (
    <div className="mx-auto flex h-[460px] w-full max-w-[400px] flex-col justify-center gap-10 py-20 md:h-[500px]">
      <div className="relative flex w-full items-center justify-center">
        <button className="absolute left-0" type="button" onClick={handleBack}>
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <h2 className="text-4xl font-bold">회원가입</h2>
      </div>
      <Progress className="bg-gray-200" value={25 * step} />
      {/* 폼시작 */}
      <Form {...form}>
        <form className="flex w-full flex-col items-center gap-2">
          {step === 1 && (
            <div className="flex w-full flex-col items-center gap-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col items-center">
                    <div className="flex w-full items-center gap-2">
                      <FormLabel className="w-32 font-semibold">
                        이메일
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="text-sm"
                          placeholder="이메일을 입력해주세요."
                          {...field}
                        />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />
              <Button
                className="mt-8 w-[100px]"
                type="button"
                onClick={handleSendCode}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "인증번호 발송"
                )}
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="flex w-full flex-col items-center gap-2">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col items-center">
                    <div className="flex w-full items-center justify-center gap-2">
                      <FormLabel className="w-12 font-semibold">인증</FormLabel>
                      <FormControl>
                        <InputOTP
                          maxLength={6}
                          pattern={REGEXP_ONLY_DIGITS}
                          {...field}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />

              <Button
                className="mt-8"
                type="button"
                disabled={isLoading}
                onClick={handleValidCode}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "다음"
                )}
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="flex w-full flex-col items-center gap-2">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col items-center">
                    <div className="flex w-full items-center gap-2">
                      <FormLabel className="w-36 font-semibold">
                        비밀번호
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          className="text-sm"
                          placeholder="영문, 숫자, 특수문자 포함 8자 이상"
                          {...field}
                        />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="passwordConfirm"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col items-center">
                    <div className="flex w-full items-center gap-2">
                      <FormLabel className="w-36 font-semibold">
                        비밀번호 확인
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          className="text-sm"
                          placeholder="비밀번호를 다시 입력해주세요."
                          {...field}
                        />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />
              <Button
                className="mt-8"
                type="button"
                onClick={handleValidPassword}
              >
                다음
              </Button>
            </div>
          )}

          {step === 4 && (
            <div className="flex w-full flex-col items-center">
              <FormField
                control={form.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col items-center">
                    <div className="flex w-full items-center gap-2">
                      <FormLabel className="w-16 font-semibold">
                        닉네임
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="text-sm"
                          placeholder="닉네임을 입력해주세요."
                          {...field}
                        />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />
              <Button
                className="mt-8 w-[84px]"
                type="button"
                onClick={handleValidNickname}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "중복 확인"
                )}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
