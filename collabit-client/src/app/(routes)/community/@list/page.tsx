import FloatingButton from "@/entities/common/ui/FloatingButton";
import CommunityCard from "@/features/community/ui/CommunityCard";
import { PostListResponse } from "@/shared/types/response/post";

const ListPage = async () => {
  // const posts = await getPostListAPI();

  return (
    <div className="relative w-full">
      <h2 className="sr-only">커뮤니티</h2>

      {posts ? (
        posts.map((post) => <CommunityCard key={post.code} post={post} />)
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span className="text-sm text-muted-foreground">
            게시글이 없습니다.
          </span>
        </div>
      )}
      <FloatingButton href={"/community/post"} />
    </div>
  );
};

export default ListPage;

const posts: PostListResponse[] = [
  {
    code: 1,
    author: {
      githubId: "clapsheep",
      nickname: "clapsheep",
      profileImage: "https://github.com/shadcn.png",
    },
    content:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ab, cumque nobis suscipit neque voluptate numquam officia blanditiis, quisquam fugiat eaque est ducimus, ipsum quod culpa! Qui non voluptas quasi debitis?",
    images: [
      "https://github.com/shadcn.png",
      "https://github.com/shadcn.png",
      "https://github.com/shadcn.png",
      "https://github.com/shadcn.png",
    ],
    likes: 100,
    comments: 100,
    isLiked: true,
    createdAt: "2025-01-31",
    updatedAt: "2025-01-31",
  },
  {
    code: 2,
    author: {
      githubId: "apeach",
      nickname: "어피치",
      profileImage: "https://github.com/shadcn.png",
    },
    content:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ab, cumque nobis suscipit neque voluptate numquam officia blanditiis, quisquam fugiat eaque est ducimus, ipsum quod culpa! Qui non voluptas quasi debitis?",
    images: [
      "https://github.com/shadcn.png",
      "https://github.com/shadcn.png",
      "https://github.com/shadcn.png",
    ],
    likes: 100,
    comments: 100,
    isLiked: false,
    createdAt: "2025-01-29",
    updatedAt: "2025-01-29",
  },
  {
    code: 3,
    author: {
      githubId: "cunni",
      nickname: "춘식이",
      profileImage: "https://github.com/shadcn.png",
    },
    content:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ab, cumque nobis suscipit neque voluptate numquam officia blanditiis, quisquam fugiat eaque est ducimus, ipsum quod culpa! Qui non voluptas quasi debitis?",
    images: ["https://github.com/shadcn.png", "https://github.com/shadcn.png"],
    likes: 100,
    comments: 100,
    isLiked: false,
    createdAt: "2025-01-04",
    updatedAt: "2025-01-04",
  },
  {
    code: 4,
    author: {
      githubId: "frodo",
      nickname: "프로도",
      profileImage: "https://github.com/shadcn.png",
    },
    content:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ab, cumque nobis suscipit neque voluptate numquam officia blanditiis, quisquam fugiat eaque est ducimus, ipsum quod culpa! Qui non voluptas quasi debitis?",
    images: ["https://github.com/shadcn.png"],
    likes: 100,
    comments: 100,
    isLiked: false,
    createdAt: "2024-12-25",
    updatedAt: "2024-12-25",
  },
  {
    code: 5,
    author: {
      githubId: "muji",
      nickname: "무지",
      profileImage: "https://github.com/shadcn.png",
    },
    content:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ab, cumque nobis suscipit neque voluptate numquam officia blanditiis, quisquam fugiat eaque est ducimus, ipsum quod culpa! Qui non voluptas quasi debitis?",
    images: [],
    likes: 100,
    comments: 100,
    isLiked: false,
    createdAt: "2024-12-12",
    updatedAt: "2024-12-12",
  },
];
