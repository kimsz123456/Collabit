import { z } from "zod";

const PasswordChangeSchema = z.object({
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
});

export default PasswordChangeSchema;
