package com.collabit.global.security;

import com.collabit.auth.domain.dto.TokenDTO;

import com.collabit.auth.exception.InvalidTokenException;
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
    private static final long ACCESS_TOKEN_EXPIRE_TIME = 1000* 60 * 30; // 30분
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
    public void validateToken(String token) {
        Jwts.parserBuilder() // JWT token 을 파싱하기 위한 객체 생성
                .setSigningKey(key) // 서명 검증에 사용할 키(비밀키)
                .build().parseClaimsJws(token); // token 검증
        log.debug("Token validated");
    }

    // JWT 토큰 파싱해서 내부 claims 추출
    private Claims parseClaims(String accessToken) {
        try {
            return Jwts.parserBuilder().
                    setSigningKey(key) // 서명검증을 위한 비밀키 등록
                    .build().parseClaimsJws(accessToken).getBody();
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

}
