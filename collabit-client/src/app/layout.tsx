import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Footer from "@/features/common/ui/footer/Footer";
import Header from "@/widget/ui/Header";
import QueryProviders from "../shared/lib/query/QueryProviders";
import "./globals.css";
import ModalContainer from "@/shared/ui/ModalContainer";
import { Toaster } from "@/shared/ui/toaster";

import NotificationInitializer from "@/widget/ui/NotificationInitializer";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Collabit",
  description:
    "동료들의 솔직한 피드백으로 발견하는 나의 숨겨진 협업 스타일. IT 업계 종사자들을 위한 새로운 성장 플랫폼, collabit",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="ko-KR">
      <body className={`${inter.className}`}>
        <QueryProviders>
          <NotificationInitializer />
          <Header />
          <main className="w-full px-5 pb-10 md:px-20 md:pb-0">
            {children}
            {modal}
          </main>
          <Footer />
          <ModalContainer />
          <Toaster />
          <ReactQueryDevtools />
        </QueryProviders>
      </body>
    </html>
  );
}
