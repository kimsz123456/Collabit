"use client";
import usePasswordChange from "@/features/user/api/usePasswordChange";
import { Button } from "@/shared/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Progress } from "@/shared/ui/progress";
import { ArrowLeftIcon, Loader2 } from "lucide-react";

export default function PasswordChangePage() {
  const {
    form,
    step,
    isLoading,
    handleValidPassword,
    handleCurrentPassword,
    onSubmit,
    handleBack,
  } = usePasswordChange();

  return (
    <div className="mx-auto flex h-[460px] w-full max-w-[400px] flex-col justify-center gap-10 py-20 md:h-[500px]">
      <div className="relative flex w-full items-center justify-center">
        <button className="absolute left-0" type="button" onClick={handleBack}>
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <h2 className="text-4xl font-bold">비밀번호 변경</h2>
      </div>
      <Progress className="bg-gray-200" value={33.33 * step} />
      {/* 폼시작 */}
      <Form {...form}>
        <form
          className="flex w-full flex-col items-center gap-2"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          {step === 1 && (
            <div className="flex w-full flex-col items-center gap-2">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col items-center">
                    <div className="flex w-full items-center gap-2">
                      <FormLabel className="w-32 font-semibold">
                        현재 비밀번호
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="text-sm"
                          type="password"
                          placeholder="현재 비밀번호를 입력해주세요."
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
                onClick={handleCurrentPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "확인"
                )}
              </Button>
            </div>
          )}

          {step === 2 && (
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
                확인
              </Button>
            </div>
          )}

          {step === 3 && (
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
                onClick={handleValidPassword}
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
