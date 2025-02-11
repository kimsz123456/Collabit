package com.collabit.global.security;

import com.collabit.auth.domain.dto.TokenDTO;

import com.collabit.auth.exception.InvalidTokenException;
import com.collabit.global.common.ErrorCode;
import com.collabit.global.error.exception.BusinessException;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.stream.Collectors;


// 유저 정보로 JWT 토근 생성 or 토큰에서 유저정보 가져옴
@Slf4j
@Component
public class TokenProvider {
    private static final String AUTHORITIES_KEY = "auth";
    private static final String BEARER_TYPE = "Bearer";
    private static final long ACCESS_TOKEN_EXPIRE_TIME = 1000 * 60 * 30; // 30분
    private static final long REFRESH_TOKEN_EXPIRE_TIME = 1000 * 60 * 60 * 12; // 12시간


    // 비밀키 객체: 서명 만들 때 or 검증에 사용
    private final Key key;

    private final CustomUserDetailsService customUserDetailsService;

    // 비밀키 생성하는 로직
    public TokenProvider(@Value("${jwt.secret-key}") String secretKey, CustomUserDetailsService customUserDetailsService){
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        this.key = Keys.hmacShaKeyFor(keyBytes); // 비밀키 객체 생성

        this.customUserDetailsService = customUserDetailsService; // 주입
    }

    // (로그인 시) 유저 정보를 넘겨받아 access token과 refresh token 생성
    public TokenDTO generateTokenDto(Authentication authentication) {
        // Authentication 에서 CustomUserDetails 추출
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        // 권한들 가져오기
        String authorities = authentication.getAuthorities().stream() // stream으로 변환 순차접근 가능
                .map(GrantedAuthority::getAuthority) // 권한 객체에서 이름(text) 추출
                .collect(Collectors.joining(",")); // ,로 연결


        long now = (new Date()).getTime();

        // Access Token 생성
        Date accessTokenExpiresIn = new Date(now + ACCESS_TOKEN_EXPIRE_TIME);
        String accessToken = Jwts.builder()
                .setSubject(userDetails.getCode()) // payload "sub" : "code(PK)"
                .claim(AUTHORITIES_KEY, authorities) // payload "auth" : "ROLE_USER"
                .setExpiration(accessTokenExpiresIn) // payload "exp" : "~~~"
                .signWith(key, SignatureAlgorithm.HS512) // header "alg" : "HS512"
                .compact();

        // Refresh Token 생성
        String refreshToken = Jwts.builder()
                .setSubject(userDetails.getCode())
                .claim(AUTHORITIES_KEY, authorities) // payload "auth" : "ROLE_USER"
                .setExpiration(new Date(now + REFRESH_TOKEN_EXPIRE_TIME))
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();

        log.debug("Access token and refresh token generated");

        return TokenDTO.builder()
                .grantType(BEARER_TYPE)
                .accessToken(accessToken)
                .accessTokenExpiresIn(accessTokenExpiresIn.getTime())
                .refreshToken(refreshToken)
                .build();
    }

    // Refresh Token 을 이용해서 Access Token 만 재발급하는 메서드
    public String generateAccessToken(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        String authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        long now = (new Date()).getTime();

        // Access Token 만 새로 생성

        log.debug("Access token and refresh token generated");

        Date accessTokenExpiresIn = new Date(now + ACCESS_TOKEN_EXPIRE_TIME);
        return Jwts.builder()
                .setSubject(userDetails.getCode())
                .claim(AUTHORITIES_KEY, authorities)
                .setExpiration(accessTokenExpiresIn)
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();


    }

    // JWT 토큰 복호화해서 토큰에 들어있는 정보 추출
    public Authentication getAuthentication(String accessToken) {
        // 토큰 복호화
        Claims claims = parseClaims(accessToken);

        if(claims.get(AUTHORITIES_KEY) == null) {
            log.debug("No claims found for access token");
            throw new InvalidTokenException();
        }

        // claims 에서 권한 정보 가져오기
        Collection<? extends GrantedAuthority> authorities =
                Arrays.stream(claims.get(AUTHORITIES_KEY).toString().split(","))
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());

        // UserDetails 객체 생성 후 Authentication 리턴
        // principal: 사용자 정보(code(pk), password, authorities 등) 포함
        String userCode = claims.getSubject(); // sub에 저장된 userCode 가져오기

        // DB 조회하여 추가 정보를 채움 (CustomUserDetailsService를 통해 로드)
        UserDetails principal = customUserDetailsService.loadUserByUserCode(userCode);

        // 반환된 Authentication 타입 객체는 SecurityContext 에 저장되어 참조됨
        return new UsernamePasswordAuthenticationToken(principal, "", authorities);

    }

    // token 정보 검증
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder() // JWT token 을 파싱하기 위한 객체 생성
                    .setSigningKey(key) // 서명 검증에 사용할 키(비밀키)
                    .build()
                    .parseClaimsJws(token); // token 검증
            log.debug("Token validated");
            return true;
        } catch (SecurityException | MalformedJwtException e) {
            log.debug("잘못된 JWT 서명입니다.");
        } catch (ExpiredJwtException e) {
            log.debug("만료된 JWT 토큰입니다.");
        } catch (UnsupportedJwtException e) {
            log.debug("지원되지 않는 JWT 토큰입니다.");
        } catch (IllegalArgumentException e) {
            log.debug("JWT 토큰이 잘못되었습니다.");
        }
        return false;
    }

    // JWT 토큰 파싱해서 내부 claims 추출
    private Claims parseClaims(String token) {
        try {
            return Jwts.parserBuilder().
                    setSigningKey(key) // 서명검증을 위한 비밀키 등록
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException e) {
            return e.getClaims();
        }

    }

    // JWT 토큰의 남은 유효 시간 계산 메서드
    public long getRemainingExpiration(String token) {
        try {
            Claims claims = parseClaims(token); // JWT Claims 가져오기
            Date expiration = claims.getExpiration(); // 만료 시간
            long now = new Date().getTime(); // 현재 시간 (밀리초)

            return expiration.getTime() - now; // 남은 시간 (밀리초)
        } catch (Exception e) {
            return 0; // 만료되었거나 잘못된 토큰이면 0 반환
        }
    }

    // Getter 메서드 추가
    public long getAccessTokenExpireTime() {
        return ACCESS_TOKEN_EXPIRE_TIME;
    }

    public long getRefreshTokenExpireTime() {
        return REFRESH_TOKEN_EXPIRE_TIME;
    }

    // 회원가입시 이메일 검증을 위한 임시 인증 토큰 발급 메서드
    public String generateVerificationToken(String email) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setSubject(email) // 토큰의 subject 를 이메일로 설정
                .claim("purpose", "EMAIL_VERIFICATION") // 토큰 용도를 EMAIL_VERIFICATION로 지정
                .setExpiration(new Date(now + 1000 * 60 * 10)) // 10분 유효
                .signWith(key, SignatureAlgorithm.HS512) // 서명 생성
                .compact();
    }

    // 회원가입시 이메일 검증을 위한 임시 인증 토큰 검증 메서드
    public Claims validateVerificationToken(String token) {
        validateToken(token);

        Claims claims = parseClaims(token);

        // 토큰의 용도가 EMAIL_VERIFICATION인지 확인
        if (!"EMAIL_VERIFICATION".equals(claims.get("purpose", String.class))) {
            throw new InvalidTokenException();
        }

        return claims;
    }

    // 마이페이지 비밀번호 변경을 위한 임시 인증 토큰 발급 메서드
    public String generatePasswordChangeToken(String userCode) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setSubject(userCode) // userCode를 토큰의 subject로 사용
                .claim("purpose", "PASSWORD_CHANGE") // 토큰의 용도 지정
                .setExpiration(new Date(now + 1000 * 60 * 10)) // 10분 유효
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }

    // 마이페이지 비밀번호 변경을 위한 임시 인증 토큰 검증 메서드
    public Claims validatePasswordChangeToken(String token, String userCode) {
        validateToken(token);

        Claims claims = parseClaims(token);

        // 토큰의 용도가 PASSWORD_CHANGE인지 확인
        if (!"PASSWORD_CHANGE".equals(claims.get("purpose", String.class))) {
            throw new InvalidTokenException();
        }

        // 동일한 유저인지 확인
        if (!userCode.equals(claims.getSubject())) {
            throw new InvalidTokenException();
        }

        return claims;
    }

}
