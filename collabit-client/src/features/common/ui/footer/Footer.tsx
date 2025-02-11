"use client";
import { QUERY_SIZE } from "@/shared/constant/QUERY_SIZE";
import useMediaQuery from "@/shared/hooks/useMediaQuery";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Footer = () => {
  const isMobile = useMediaQuery(QUERY_SIZE.md);
  const pathname = usePathname();
  if (pathname !== "/") {
    return null;
  }
  const Sitemap = [
    {
      name: "리포트",
      menu: [{ name: "리포트", href: "/report" }],
    },
    {
      name: "프로젝트",
      menu: [
        { name: "나의 프로젝트", href: "/project" },
        { name: "프로젝트 생성", href: "/project/create" },
      ],
    },
    {
      name: "커뮤니티",
      menu: [{ name: "커뮤니티", href: "/community" }],
    },
    {
      name: "채팅",
      menu: [{ name: "채팅", href: "/chat" }],
    },
  ];

  return (
    <footer className="mx-auto mb-20 flex max-w-5xl justify-center gap-10 px-5 py-10 sm:justify-between md:mb-0 md:px-20">
      <div className="flex flex-col items-center gap-2 sm:items-start">
        <Link
          href="/"
          className="flex h-[60px] w-[150px] items-center justify-center p-2"
        >
          <Image
            src="/images/logo-lg.png"
            alt="collabit"
            width={isMobile ? 65 : 100}
            height={isMobile ? 24 : 40}
            priority
          />
        </Link>
        <p className="text-balance text-center text-xs sm:text-left">
          &#34; 동료들의 솔직한 피드백으로 발견하는 나의 숨겨진 협업 스타일.
          <br /> IT 업계 종사자들을 위한 새로운 성장 플랫폼, collabit &#34;
        </p>
        <p className="text-center text-xs text-gray-500 sm:text-left">
          Copyright &copy; 2025 &#8729; collabit
        </p>
      </div>
      <ul className="hidden flex-wrap text-sm sm:flex sm:gap-[50px]">
        {Sitemap.map((item) => (
          <li key={item.name} className="flex flex-col gap-4">
            <p>{item.name}</p>
            {item.menu.map((menu) => (
              <Link
                className="text-xs text-gray-500"
                href={menu.href}
                key={menu.name}
              >
                {menu.name}
              </Link>
            ))}
          </li>
        ))}
      </ul>
    </footer>
  );
};

export default Footer;
