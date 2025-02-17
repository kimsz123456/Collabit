"use client";

import { useAuth } from "@/features/auth/api/useAuth";
import { createCommentAPI } from "@/shared/api/comment";
import { useToast } from "@/shared/hooks/use-toast";
import { cn } from "@/shared/lib/shadcn/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface CommponetInputProps {
  postCode: number;
}

const formSchema = z.object({
  comment: z
    .string()
    .min(1, "댓글을 입력해주세요")
    .max(100, "100자 이하로 입력해주세요"),
});

const CommponetInput = ({ postCode }: CommponetInputProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { userInfo } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comment: "",
    },
  });

  const { mutate: createComment } = useMutation({
    mutationFn: ({
      content,
      postCode,
    }: {
      content: string;
      postCode: number;
    }) => createCommentAPI({ postCode, content, parentCommentCode: undefined }),
    onSuccess: () => {
      toast({
        description: "댓글이 작성되었습니다.",
      });
      form.reset();
      queryClient.refetchQueries({
        queryKey: ["commentList", postCode],
      });
      queryClient.refetchQueries({
        queryKey: ["postDetail", Number(postCode)],
      });
      queryClient.refetchQueries({
        queryKey: ["posts", "infinite"],
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "댓글을 입력해주세요",
      });
    },
  });

  const onError = () => {
    toast({
      variant: "destructive",
      description: "댓글을 입력해주세요",
    });
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createComment({
      content: values.comment,
      postCode,
    });
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 border-b border-b-border pb-2",
      )}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onError)}
          className="flex w-full gap-2"
        >
          <div className="flex w-full items-center gap-2">
            <Avatar className={cn("ml-2 h-6 w-6")}>
              <AvatarImage src={userInfo?.profileImage ?? ""} />
              <AvatarFallback>
                {userInfo?.nickname?.slice(0, 2) ?? "C"}
              </AvatarFallback>
            </Avatar>
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input
                      className="w-full border-none shadow-none"
                      placeholder="댓글을 입력하세요"
                      disabled={!userInfo}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={!userInfo}>
              작성
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CommponetInput;
