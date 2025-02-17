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
import { z } from "zod";

interface CommentReplyInputProps {
  parentCommentCode: number;
  postCode: number;
  onCancel: () => void;
}

const formSchema = z.object({
  comment: z
    .string()
    .min(1, "댓글을 입력해주세요")
    .max(100, "100자 이하로 입력해주세요"),
});

const CommentReplyInput = ({
  parentCommentCode,
  postCode,
  onCancel,
}: CommentReplyInputProps) => {
  console.log("부모 댓글 : ", parentCommentCode);

  const { userInfo } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      parentCommentCode,
    }: {
      content: string;
      postCode: number;
      parentCommentCode: number;
    }) => createCommentAPI({ postCode, content, parentCommentCode }),
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
    console.log(
      "제출",
      "게시글 : ",
      postCode,
      "댓글 : ",
      values.comment,
      "부모 댓글 : ",
      parentCommentCode,
    );

    createComment({
      content: values.comment,
      postCode,
      parentCommentCode,
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
            <Avatar className={cn("ml-4 h-6 w-6")}>
              <AvatarImage src={userInfo?.profileImage} />
              <AvatarFallback>{userInfo?.nickname?.slice(0, 2)}</AvatarFallback>
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

export default CommentReplyInput;
