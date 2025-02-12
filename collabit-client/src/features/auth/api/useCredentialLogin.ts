import { useToast } from "@/shared/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import LoginSchema from "../types/LoginSchema";
import { z } from "zod";
import { loginCredentialAPI } from "@/shared/api/auth";

const useCredentialLogin = () => {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const isLoginValid = await form.trigger("email");
    const emailValue = form.getValues("email");
    const emailError = form.getFieldState("email").error;
    if (!isLoginValid || !emailValue || emailError) {
      toast({
        title: emailError?.message,
        variant: "destructive",
      });
      return;
    }

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

    try {
      await onSubmit(form.getValues());
      router.push("/auth/callback");
    } catch (error) {
      console.error(error);
    }
  };

  const onSubmit = async (data: z.infer<typeof LoginSchema>) => {
    try {
      await loginCredentialAPI(data);
      window.location.href ="/auth/callback";
    } catch (error) {
      console.error(error);
    }
  };
  return { form, handleLogin };
};
export default useCredentialLogin;
