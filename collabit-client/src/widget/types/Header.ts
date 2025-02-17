import { UserInfo } from "@/shared/types/model/User";

export interface HeaderProps {
  isLogin: boolean;
  handleToLogin: () => void;
  handleLogout: () => void;
  handleToMyPage: () => void;
  menuList?: { name: string; href: string; isNew: boolean }[];
  userInfo?: UserInfo;
  isChatRoom?: boolean;
}
