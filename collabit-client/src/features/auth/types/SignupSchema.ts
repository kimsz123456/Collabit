import { z } from "zod";

const SignupSchema = z
  .object({
    email: z.string().email({ message: "이메일 형식이 올바르지 않습니다." }),
    code: z.string().min(6, { message: "인증번호는 6자리입니다." }),
    password: z
      .string()
      .min(8, {
        message: "비밀번호는 영문, 숫자, 특수문자를 포함한 8~16자리입니다.",
      })
      .max(16, {
        message: "비밀번호는 영문, 숫자, 특수문자를 포함한 8~16자리입니다.",
      })
      .regex(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])/, {
        message: "비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.",
      }),
    passwordConfirm: z.string(),
    nickname: z
      .string()
      .min(2, { message: "닉네임은 2자리 이상입니다." })
      .max(8, { message: "닉네임은 8자리 이하입니다." }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "비밀번호가 일치하지 않습니다.",
  });
export default SignupSchema;
