import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getPortfolioShareAPI } from "@/shared/api/report";

async function fetchReportShare(user: string) {
  return getPortfolioShareAPI(user);
}
// Edge Runtime 대신 Node.js Runtime 사용
export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ user: string }> },
) {
  try {
    const { user } = await params;
    // 데이터 가져오기
    const data = await fetchReportShare(user);
    const strength = data.aiSummary?.strength ?? "협업 역량을 분석중입니다.";
    const nickname = data.portfolioInfo?.nickname ?? user;

    // 로고 이미지를 Base64로 변환
    const logoImageResponse = await fetch(
      new URL("/images/logo-lg.png", request.url),
    );
    const logoImageBuffer = await logoImageResponse.arrayBuffer();
    const logoImageBase64 = `data:image/png;base64,${Buffer.from(logoImageBuffer).toString("base64")}`;

    return new ImageResponse(
      (
        <div
          style={{
            background: "linear-gradient(to bottom, #1E1E1E, #2E1E3E)",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px",
            fontFamily: "pretendard",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 40,
              left: 40,
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            {/* 로고 이미지 */}
            <img
              src={logoImageBase64}
              width="32"
              height="32"
              alt="Collabit Logo"
            />
            <span style={{ color: "#ffffff", fontSize: 24 }}>Collabit</span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "24px",
              maxWidth: "800px",
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontWeight: "bold",
                color: "#ffffff",
                textAlign: "center",
              }}
            >
              {nickname}님의 강점
            </div>

            <div
              style={{
                fontSize: 32,
                color: "#E2E8F0",
                textAlign: "center",
                lineHeight: 1.4,
                padding: "24px",
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              {strength}
            </div>

            <div
              style={{
                position: "absolute",
                bottom: 40,
                color: "#94A3B8",
                fontSize: 24,
              }}
            >
              Collabit AI가 분석한 협업 리포트
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e) {
    console.error(e);
    return new Response(`Failed to generate image`, {
      status: 500,
    });
  }
}
