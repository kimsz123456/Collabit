import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getPortfolioShareAPI } from "@/shared/api/report";

// Edge Runtime으로 변경
export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const pathParts = request.nextUrl.pathname.split("/");
    const user = pathParts[pathParts.length - 2];

    if (!user) {
      throw new Error("User ID not found in URL");
    }

    const data = await getPortfolioShareAPI(user);
    console.log("User:", user);
    console.log("Data received:", JSON.stringify(data, null, 2));

    // Edge Runtime에서는 fs 모듈을 사용할 수 없으므로, 로고는 URL로 변경
    const logoUrl = new URL("/images/logo-lg.png", request.nextUrl.origin).href;

    const strength = data?.aiSummary?.strength ?? "협업 역량을 분석중입니다.";
    const nickname = data?.portfolioInfo?.nickname ?? user;

    return new ImageResponse(
      (
        <div
          style={{
            background: "linear-gradient(135deg, #8B5CF6, #4F46E5)",
            width: "1200px",
            height: "630px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            padding: "60px",
            fontFamily: "system-ui",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 40,
              left: 40,
              display: "flex",
              alignItems: "center",
            }}
          >
            <img
              src={logoUrl}
              width="64"
              height="40"
              alt="Collabit Logo"
              style={{
                objectFit: "contain",
              }}
            />
          </div>

          <div
            style={{
              color: "#F3F4F6",
              fontSize: 28,
              display: "flex",
              marginBottom: "40px",
              opacity: 0.9,
            }}
          >
            Collabit AI가 분석한 협업 리포트
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "32px",
              width: "100%",
              maxWidth: "1000px",
            }}
          >
            <div
              style={{
                fontSize: 56,
                fontWeight: "bold",
                color: "#ffffff",
                textAlign: "center",
                display: "flex",
              }}
            >
              {nickname}님의 강점
            </div>

            <div
              style={{
                fontSize: 36,
                color: "#ffffff",
                textAlign: "center",
                lineHeight: 1.5,
                padding: "40px 60px",
                background: "rgba(255, 255, 255, 0.15)",
                borderRadius: "24px",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                display: "flex",
                width: "100%",
                maxWidth: "1000px",
                backdropFilter: "blur(10px)",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "200px",
                wordBreak: "keep-all",
                whiteSpace: "pre-wrap",
              }}
            >
              {strength}
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 40,
              right: 40,
              color: "#ffffff",
              fontSize: 20,
              display: "flex",
              opacity: 0.8,
            }}
          >
            collabit.site
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (error) {
    console.error("Error details:", error);

    return new ImageResponse(
      (
        <div
          style={{
            background: "linear-gradient(to bottom, #1E1E1E, #2E1E3E)",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            color: "white",
            fontFamily: "system-ui",
          }}
        >
          Collabit 협업 리포트
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  }
}
