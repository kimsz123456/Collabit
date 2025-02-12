package com.collabit.auth.service;


import com.collabit.auth.domain.dto.TokenDTO;
import com.collabit.auth.domain.dto.UserLoginRequestDTO;
import com.collabit.auth.domain.dto.UserResponseDTO;
import com.collabit.auth.domain.dto.UserSignupRequestDTO;
import com.collabit.global.common.ErrorCode;
import com.collabit.global.error.exception.BusinessException;
import com.collabit.global.security.CustomUserDetails;
import com.collabit.global.security.TokenProvider;
import com.collabit.user.domain.entity.Role;
import com.collabit.user.domain.entity.User;
import com.collabit.user.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
    private final AuthenticationManagerBuilder authenticationManagerBuilder;
    private final PasswordEncoder passwordEncoder;
    private final TokenProvider tokenProvider;
    private final UserRepository userRepository;

    @Transactional
    public UserResponseDTO login(UserLoginRequestDTO userLoginRequestDto, HttpServletResponse response) {
        // 1. Login ID/PW를 기반으로 AuthenticationToken 생성
        String email = userLoginRequestDto.getEmail();
        String password = userLoginRequestDto.getPassword();
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(email, password);

        // 2. 사용자 인증
        Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);
        log.debug("Authenticated user: {}", authentication.getPrincipal());

        // 3. JWT 토큰 생성
        TokenDTO tokenDto = tokenProvider.generateTokenDto(authentication);
        log.debug("Generated token: {}", tokenDto.toString());

        // 4. HttpOnly Cookie 에 Access Token 과 Refresh Token 저장
        addCookie(response, "accessToken", tokenDto.getAccessToken(), tokenProvider.getAccessTokenExpireTime() / 1000);
        addCookie(response, "refreshToken", tokenDto.getRefreshToken(), tokenProvider.getRefreshTokenExpireTime() / 1000);
        log.debug("Add accessToken and refreshToken in Cookie");

        // 5. 사용자 정보 조회
        // db에 또 접근하지 말고 Authentication 객체에서 CustomUserDetails 가져오기
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        // 6. UserResponseDto 생성 및 반환
        return UserResponseDTO.builder()
                .nickname(userDetails.getNickname()) // CustomUserDetails에서 닉네임 가져오기
                .profileImage(userDetails.getProfileImage()) // CustomUserDetails에서 프로필 이미지 가져오기
                .isGithub(userDetails.getGithubId() != null) // CustomUserDetails에서 GitHub 연동 여부 가져오기
                .build();

    }

    // HttpOnly Cookie 에 토큰 저장
    public void addCookie(HttpServletResponse response, String name, String value, long maxAge) {
      Cookie cookie = new Cookie(name, value);
      cookie.setHttpOnly(true); // HttpOnly 설정
      cookie.setSecure(true); // HTTPS 에서만 동작
      cookie.setPath("/"); // 쿠키가 유효한 경로
      response.addCookie(cookie); // 클라이언트로 쿠키 전송 필수
  }

    // 회원가입 메서드
    public UserResponseDTO signup(UserSignupRequestDTO userSignupRequestDto) {
        String email = userSignupRequestDto.getEmail();
        String nickname = userSignupRequestDto.getNickname();

        // 이메일 중복체크
        isEmailAlreadyExists(email);

        // 닉네임 중복체크
        isNicknameAlreadyExists(nickname);

        // 비밀번호 암호화
        String encodedPassword = encodePassword(userSignupRequestDto.getPassword());

        // 회원 정보 생성
        User user = User.builder()
                .email(userSignupRequestDto.getEmail())
                .password(encodedPassword)
                .nickname(userSignupRequestDto.getNickname())
                .profileImage("기본이미지주소")
                .role(Role.ROLE_USER)
                .build();

        // 회원 저장
        userRepository.save(user);

        // UserResponseDto 생성(FE 에게 정보 전달 용)
        // isGithub 은 회원가입시에는 false. 로그인 때 확인
        return UserResponseDTO.builder()
                .nickname(user.getNickname())
                .profileImage(user.getProfileImage())
                .isGithub(false)
                .build();

    }

    // 이메일 중복 체크
    public void isEmailAlreadyExists(String email) {
        if (userRepository.existsByEmail(email)) {
            log.warn("이메일 중복 발생: {}", email);

            throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
    }

    // 닉네임 중복 체크
    public void isNicknameAlreadyExists(String nickname) {
        if (userRepository.existsByNickname(nickname)) {
            log.warn("닉네임 중복 발생: {}", nickname);

            throw new BusinessException(ErrorCode.NICKNAME_ALREADY_EXISTS);
        }
    }

    // 비밀번호 암호화
    private String encodePassword(String password){
        return passwordEncoder.encode(password);
    }
}



