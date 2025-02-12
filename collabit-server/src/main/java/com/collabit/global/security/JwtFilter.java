package com.collabit.global.security;

import com.collabit.auth.service.AuthService;
import com.collabit.global.common.ErrorCode;
import com.collabit.global.error.exception.BusinessException;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {
    // http request header 에서 "JWT 토큰이 포함된" 헤더의 이름
    public static final String AUTHORIZATION_HEADER = "Authorization";
    // Authorization header 에서 토큰 앞에 붙는 prefix
    public static final String BEARER_PREFIX = "Bearer ";

    private final TokenProvider tokenProvider;
    private final RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private ApplicationContext applicationContext;

    // JWT 토큰 인증 정보 검증후, SecurityContext 에 검증된 인증 정보 저장
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        try {
            // request cookie에서 토큰 추출
            String accessToken = resolveToken(request, "accessToken");
            String refreshToken = resolveToken(request, "refreshToken");
            log.debug("access token: {}", accessToken);
            log.debug("refresh token: {}", refreshToken);

            // accessToken 검증
            if (accessToken != null && tokenProvider.validateToken(accessToken)) {
                // 액세스 토큰이 유효한 경우 인증 처리
                Authentication authentication = tokenProvider.getAuthentication(accessToken);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
            // accessToken이 유효하지 않은 경우 refreshToken 확인
            else if (refreshToken != null && tokenProvider.validateToken(refreshToken)) {
                // 리프레시 토큰으로 새로운 액세스 토큰 발급
                String newAccessToken = tokenProvider.createNewAccessToken(refreshToken);

                // 새로운 액세스 토큰을 쿠키에 설정
                Cookie newAccessTokenCookie = new Cookie("accessToken", newAccessToken);
                newAccessTokenCookie.setHttpOnly(true);
                newAccessTokenCookie.setPath("/");
                // newAccessTokenCookie.setSecure(true); // HTTPS 사용시 주석 해제
                response.addCookie(newAccessTokenCookie);

                // 새 토큰으로 인증 처리
                Authentication authentication = tokenProvider.getAuthentication(newAccessToken);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }

        } catch (ExpiredJwtException e) {
            log.error("ExpiredJwtException: {}", e.getMessage());
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "토큰이 만료되었습니다.");
            return;

        } catch (MalformedJwtException e) {
            log.error("MalformedJwtException: {}", e.getMessage());
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "잘못된 형식의 토큰입니다.");
            return;

        } catch (SignatureException e) {
            log.error("SignatureException: {}", e.getMessage());
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "토큰 서명이 유효하지 않습니다.");
            return;

        } catch (Exception e) {
            log.error("예상치 못한 JWT 인증 오류 발생: {}", e.getMessage());
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "JWT 인증 실패: " + e.getMessage());
            return;
        }

        filterChain.doFilter(request, response);
    }


    // Request Header 에서 JWT 토큰정보 추출
    private String resolveToken(HttpServletRequest request,String tokenType) {
        // 쿠키에서 accessToken 체크
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                log.debug("Found cookie: {} = {}", cookie.getName(), cookie.getValue());
                if (tokenType.equals(cookie.getName())) {
                    log.debug("Token found in cookie");
                    return cookie.getValue();
                }
            }
        }
        log.debug("No token found");
        return null;
    }
}

