import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  console.log("Middleware running for:", request.nextUrl.pathname);

  // 먼저 토큰 체크
  const token = request.cookies.get("accessToken");
  if (!token) {
    // 로그인 페이지로 리다이렉트 하기 전에 현재 경로 저장
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.set("lastPath", request.nextUrl.pathname);
    return response;
  }

  // survey 경로에 대해서만 추가 검증
  if (request.nextUrl.pathname.startsWith("/survey/")) {
    console.log("survey 경로에 대해서만 추가 검증");
    try {
      const projectId = request.nextUrl.pathname.replace(/^\/survey\//, "");

      // 원래 요청의 쿠키를 새 요청에 포함
      const requestHeaders = new Headers(request.headers);
      const cookie = request.cookies.toString();
      if (cookie) {
        requestHeaders.set("Cookie", cookie);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/survey/${projectId}/verify`,
        {
          credentials: "include",
          headers: requestHeaders,
          mode: "cors", // CORS 모드 명시
        },
      );

      console.log("Response status:", res.status); // 응답 상태 확인용 로그

      if (res.status === 403 || res.status === 401 || res.status === 404) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
      return NextResponse.next();
    } catch (error) {
      console.error("Survey access verification failed:", error);
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // 로그인 페이지가 아닌 경우에만 lastPath 저장
  if (request.nextUrl.pathname !== "/login") {
    const response = NextResponse.next();
    response.cookies.set("lastPath", request.nextUrl.pathname);
    return response;
  }

  try {
    const secretKey = process.env.NEXT_JWT_SECRET_KEY;
    if (!secretKey) {
      throw new Error("JWT 시크릿 키가 설정되지 않았습니다.");
    }

    const decodedSecret = Buffer.from(secretKey, "base64");
    const secret = new Uint8Array(decodedSecret);

    const { payload } = await jwtVerify(token.value, secret, {
      algorithms: ["HS512"],
    });
    console.log(payload);
    const authorities = payload.auth as string;

    if (!authorities) {
      throw new Error("권한 정보가 없습니다.");
    }
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-data", JSON.stringify(payload.auth));
    const response = NextResponse.next();

    return response;
  } catch (error) {
    console.error("JWT 검증 실패:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/project/:path*",
    "/mypage/:path*",
    "/chat/:path*",
    "/report/:path*",
    "/survey/:path*",
    "/auth/callback",
  ],
};
