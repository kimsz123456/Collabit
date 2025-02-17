"use client";

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
  img: string;
  nickname: string;
  postCode: number;
  hidden?: boolean;
  parentCode?: number;
  onCancel?: () => void;
}

const formSchema = z.object({
  comment: z
    .string()
    .min(1, "댓글을 입력해주세요")
    .max(100, "100자 이하로 입력해주세요"),
});

const CommponetInput = ({
  img,
  parentCode,
  nickname,
  postCode,
  hidden = false,
  onCancel,
}: CommponetInputProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comment: "",
    },
  });
  console.log(postCode, parentCode);

  const { mutate: createComment } = useMutation({
    mutationFn: ({
      content,
      postCode,
      parentCode,
    }: {
      content: string;
      postCode: number;
      parentCode?: number;
    }) => createCommentAPI({ postCode, content, parentCode }),
    onSuccess: () => {
      toast({
        description: "댓글이 작성되었습니다.",
      });
      form.reset();
      queryClient.invalidateQueries({
        queryKey: ["commentList", postCode],
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
    console.log("제출", postCode, parentCode, values.comment);

    createComment({
      content: values.comment,
      postCode,
      parentCode: parentCode ?? undefined,
    });
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 border-b border-b-border pb-2",
        hidden && "hidden",
      )}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onError)}
          className="flex w-full gap-2"
        >
          <div className="flex w-full items-center gap-2">
            <Avatar className={cn(parentCode !== 0 ? "" : "ml-2 h-6 w-6")}>
              <AvatarImage src={img} />
              <AvatarFallback>{nickname?.slice(0, 2)}</AvatarFallback>
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
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit">작성</Button>
            {onCancel ? (
              <Button type="button" variant="outline" onClick={onCancel}>
                취소
              </Button>
            ) : null}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CommponetInput;
