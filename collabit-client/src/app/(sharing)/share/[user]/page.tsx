import { Metadata, Viewport } from "next";
import { getPortfolioShareAPI } from "@/shared/api/report";
import dynamic from "next/dynamic";

interface SharePageProps {
  params: Promise<{ user: string }>;
}

async function fetchReportShare(user: string) {
  return getPortfolioShareAPI(user);
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1E90FF",
};

export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const { user } = await params;
  const data = await fetchReportShare(user);
  const title = `${data.portfolioInfo?.nickname}님의 협업 리포트 - Collabit`;
  const description =
    data.aiSummary?.strength ?? "협업 리포트 결과를 확인하세요.";

  const pageUrl = `https://collabit.com/share/${user}`;
  const ogImageUrl = `https://collabit.com/share/${user}/opengraph-image`;

  return {
    title,
    description,
    keywords: ["협업 리포트", "Collabit", "팀워크 분석", "AI 리포트"],
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: "Collabit",
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${data.portfolioInfo?.nickname}님의 협업 리포트`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@CollabitAI",
      creator: `@${data.portfolioInfo?.nickname || "CollabitUser"}`,
      title,
      description,
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
    icons: {
      icon: [
        {
          rel: "icon",
          url: "/favicon-32x32.png",
          sizes: "32x32",
          type: "image/png",
        },
        {
          rel: "icon",
          url: "/favicon-16x16.png",
          sizes: "16x16",
          type: "image/png",
        },
      ],
      apple: "/apple-touch-icon.png",
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}

const SurveyResult = dynamic(() => import("@/widget/report/ui/SurveyResult"), {
  ssr: true,
});

export default async function Page({ params }: SharePageProps) {
  const { user } = await params;
  const reportShare = await fetchReportShare(user);
  const portfolioInfo = reportShare?.portfolioInfo;

  return (
    <div className="mx-auto mb-20 mt-5 w-full p-4 md:max-w-5xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">
          {portfolioInfo?.nickname}님의 협업 역량 리포트
        </h1>
        <div className="flex gap-2">
          <p className="text-sm">
            <span>참여인원 </span>
            <span className="font-semibold text-violet-500">
              {portfolioInfo?.participant}명
            </span>
          </p>
          <p className="text-sm">
            <span>프로젝트 </span>
            <span className="font-semibold text-violet-500">
              {portfolioInfo?.project}회
            </span>
          </p>
        </div>
      </div>
      {reportShare && (
        <SurveyResult
          hexagon={reportShare?.hexagon}
          progress={reportShare?.progress}
          wordCloud={reportShare?.wordCloud}
          aiSummary={reportShare?.aiSummary}
          timeline={reportShare?.timeline}
        />
      )}
    </div>
  );
}

export const runtime = "nodejs";
