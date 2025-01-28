"use client";

import UserAvatar from "@/entities/common/ui/UserAvatar";
import { cn } from "@/shared/lib/shadcn/utils";
import { Button } from "@/shared/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/shared/ui/navigation-menu";
import { HeaderProps } from "@/widget/types/Header";
import { Dot } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const HeaderDesktop = ({
  isLogin,
  handleToLogin,
  handleLogout,
  handleToMyPage,
  menuList,
  hasNewChat,
}: HeaderProps) => {
  const pathname = usePathname();

  const user = {
    name: "춤추는 라이언",
  };

  return (
    <header className="flex h-[92px] w-full justify-between px-20 py-4 shadow-md">
      {/* 로고 */}
      <Link
        href="/"
        className="flex h-[60px] w-[150px] items-center justify-center p-4"
      >
        <h1 className="sr-only">Collabit</h1>
        <Image
          src="/images/logo-lg.png"
          alt="collabit"
          width={120}
          height={50}
          priority
        />
      </Link>
      <div className="flex items-center gap-4">
        {/* 메뉴 */}
        <NavigationMenu>
          <NavigationMenuList className="flex items-center">
            {menuList!.map((i) => (
              <NavigationMenuItem
                key={i.name}
                className={cn(
                  "rounded-md px-4 py-2 hover:bg-slate-100",
                  pathname.includes(i.href) && "bg-slate-100",
                )}
              >
                <NavigationMenuLink className="text-sm" href={i.href}>
                  {i.name}
                </NavigationMenuLink>
                {hasNewChat && i.name === "채팅" && (
                  <Dot className="absolute -right-1 -top-1 text-violet-700" />
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        {isLogin ? (
          <UserAvatar
            user={user}
            handleToMyPage={handleToMyPage}
            handleLogout={handleLogout}
          />
        ) : (
          <Button variant="outline" onClick={handleToLogin}>
            로그인
          </Button>
        )}
      </div>
    </header>
  );
};

export default HeaderDesktop;
