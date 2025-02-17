import {
  createPostAPI,
  deletePostAPI,
  editPostAPI,
} from "@/shared/api/community";
import { EditPostAPIRequest } from "@/shared/types/request/post";
import { PageResponse } from "@/shared/types/response/page";
import { PostListResponse } from "@/shared/types/response/post";
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useState, useEffect } from "react";

const usePost = () => {
  const queryClient = useQueryClient();
  const [images, setImages] = useState<File[]>([]);
  const [preview, setPreview] = useState<string[]>([]);
  const [content, setContent] = useState<string>("");

  const { mutate: createPost } = useMutation({
    mutationKey: ["createPost"],
    mutationFn: createPostAPI,
    onSuccess: () => {
      setImages([]);
      setPreview([]);
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["posts", "infinite"] });
    },
  });
  const { mutate: editPost } = useMutation({
    mutationKey: ["editPost"],
    mutationFn: ({ postCode, post }: EditPostAPIRequest) =>
      editPostAPI({ postCode, post }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", "infinite"] });
    },
  });
  const { mutate: deletePost } = useMutation({
    mutationFn: (postCode: number) => deletePostAPI(postCode),
    onSuccess: (_, postCode) => {
      queryClient.setQueryData(
        ["posts", "infinite"],
        (old: InfiniteData<PageResponse<PostListResponse>> | undefined) => {
          if (!old) return old;
          return {
            pages: old.pages.map((page) => ({
              ...page,
              content: page.content.filter((p) => p.code !== postCode),
            })),
            pageParams: old.pageParams,
          };
        },
      );
    },
    onError: (error) => {
      console.error("deletePost error:", error);
    },
  });
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const imageArray = Array.from(files);
      if (imageArray.length + images.length > 4) {
        alert("이미지는 최대 4개까지 업로드 가능합니다.");
        return;
      }
      setImages((prev) => [...prev, ...imageArray]);
      const newPreview = imageArray.map((file) => URL.createObjectURL(file));
      setPreview((prev) => [...prev, ...newPreview]);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  useEffect(() => {
    return () => {
      preview.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [preview]);

  const handleDeleteImage = (index: number) => {
    setPreview((prev) => prev.filter((_, i) => i !== index));
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createPost({ content, images });
  };
  return {
    images,
    preview,
    content,
    handleImageChange,
    handleContentChange,
    handleDeleteImage,
    handleSubmit,
    deletePost,
    editPost,
  };
};

export default usePost;
