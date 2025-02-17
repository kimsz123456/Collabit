"use client";

import { useAuth } from "@/features/auth/api/useAuth";
import useModalStore from "@/shared/lib/stores/modalStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import NicknameChangeModal from "@/entities/mypage/ui/NicknameChangeModal";
import Image from "next/image";
import Link from "next/link";
import ImageChangeModal from "@/entities/mypage/ui/ImageChangeModal";
import TwoButtonModal from "@/widget/ui/modals/TwoButtonModal";
import { deleteUserAPI } from "@/shared/api/user";

const ProfilePage = () => {
  const { userInfo } = useAuth();
  const { openModal } = useModalStore();
  const apiUri = process.env.NEXT_PUBLIC_API_URI;
  const handleLinkGithub = () => {
    window.location.href = `${apiUri}/oauth2/authorization/github`;
  };

  const handleChangeImage = () => {
    openModal(<ImageChangeModal />);
  };
  const handleChangeNickname = () => {
    openModal(<NicknameChangeModal />);
  };

  const handleExit = () => {
    openModal(
      <TwoButtonModal
        title="회원 탈퇴"
        description="정말로 탈퇴하시겠습니까?"
        confirmText="탈퇴"
        cancelText="취소"
        handleConfirm={deleteUserAPI}
      />,
    );
  };
  return (
    <div className="flex w-full max-w-[400px] flex-col">
      <div className="border-b py-4">
        <div className="flex gap-2 pb-4">
          <Avatar>
            <AvatarImage src={userInfo?.profileImage} />
            <AvatarFallback>{userInfo?.nickname.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold">{userInfo?.nickname}</span>
            <div className="flex items-center gap-1">
              <Image
                src="/icons/github-sm.svg"
                alt="github"
                width={16}
                height={16}
              />
              {userInfo?.githubId ? (
                <a
                  className="text-xs text-gray-400 hover:text-gray-600"
                  href={`https://github.com/${userInfo?.githubId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub 프로필 열기"
                >
                  @{userInfo?.githubId}
                </a>
              ) : (
                <Button
                  onClick={handleLinkGithub}
                  className="h-4 p-0 text-xs text-gray-400 hover:text-gray-600"
                  variant="ghost"
                >
                  Github 계정 연동하기
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 md:flex-row md:gap-4">
          <Button
            onClick={handleChangeImage}
            variant="outline"
            className="w-full"
          >
            프로필 이미지 수정
          </Button>
          <Button
            onClick={handleChangeNickname}
            variant="outline"
            className="w-full"
          >
            닉네임 변경
          </Button>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2 md:gap-4">
        {!userInfo?.githubId && (
          <Link
            className="block px-1 py-3 font-semibold hover:bg-accent"
            href="/change-password"
          >
            비밀번호 변경
          </Link>
        )}
        <button
          onClick={handleExit}
          className="px-1 py-3 text-left font-semibold hover:bg-accent"
        >
          회원탈퇴
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
