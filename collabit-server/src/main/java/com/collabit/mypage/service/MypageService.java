package com.collabit.mypage.service;

import com.collabit.auth.domain.dto.TokenDTO;
import com.collabit.auth.service.AuthService;
import com.collabit.global.common.ErrorCode;
import com.collabit.global.error.exception.BusinessException;
import com.collabit.global.security.CustomUserDetails;
import com.collabit.global.security.TokenProvider;
import com.collabit.mypage.domain.dto.ChangeNicknameRequestDTO;
import com.collabit.mypage.domain.dto.ChangePasswordRequestDTO;
import com.collabit.mypage.domain.dto.MypageCurrentUserResponseDTO;
import com.collabit.user.domain.entity.User;
import com.collabit.user.repository.UserRepository;
import groovyjarjarantlr.Token;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class MypageService {
    private final UserRepository userRepository;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;
    private final RedisTemplate<String, Object> redisTemplate;
    private final TokenProvider tokenProvider;

    // 유저 정보 조회하는 메소드
    @Transactional
    public MypageCurrentUserResponseDTO getCurrentUserInfoMypage(String userCode) {
        Optional<User> user = userRepository.findByCode(userCode);

        if (user.isEmpty()) {
            log.debug("User with code {} not found", userCode);
            throw new BusinessException(ErrorCode.DATA_NOT_FOUND);
        }

        return MypageCurrentUserResponseDTO.builder()
                .email(user.get().getEmail())
                .githubId(user.get().getGithubId())
                .nickname(user.get().getNickname())
                .profileImage(user.get().getProfileImage())
                .build();
    }

    // 비밀번호 변경하는 메서드
    @Transactional
    public void changeUserPassword(String userCode, ChangePasswordRequestDTO changePasswordRequestDTO,
                                   HttpServletRequest request) {
        // 임시 이메일 인증 토큰 추출
        String passwordChangeToken = authService.extractToken(request, "passwordChangeToken");

        if (passwordChangeToken == null) {
            throw new BusinessException(ErrorCode.PASSWORD_CHANGE_DENIED); // 토큰이 없으면 예외 발생
        }

        // 임시 인증토큰 검증
        Claims claims = tokenProvider.validatePasswordChangeToken(passwordChangeToken, userCode);

        // 사용자 조회
        Optional<User> user = userRepository.findByCode(userCode);
        log.debug("비밀번호가나올까요안나올까요...{}", user.get().getPassword());

        if (user.isEmpty()) {
            log.debug("User with code {} not found", userCode);
            throw new BusinessException(ErrorCode.DATA_NOT_FOUND);
        }

        // 현재 비밀번호가 맞는지 확인
        if(!passwordEncoder.matches(changePasswordRequestDTO.getCurrentPassword(), user.get().getPassword()) ) {
            throw new BusinessException(ErrorCode.INVALID_PASSWORD);
        }

        // 새로운 비밀번호 "암호화 후" 저장
        String encodedNewPassword = authService.encodePassword(changePasswordRequestDTO.getNewPassword());
        user.get().updatePassword(encodedNewPassword); // Dirty Checking으로 자동 업데이트

        log.debug("비밀번호 변경 완료");
    }

    public void generatePasswordChangeTokenMypageService(String userCode, HttpServletResponse response) {
        String passwordChangeToken = tokenProvider.generatePasswordChangeToken(userCode);
        authService.addCookie(response, "passwordChangeToken", passwordChangeToken, 600); // 10분 유효
    }

    // 프로필 사진 변경하는 메서드
    @Transactional
    public void changeUserProfileImage(String userCode, String newProfileImage) {
        Optional<User> userOptional = userRepository.findByCode(userCode);

        if (userOptional.isEmpty()) {
            throw new BusinessException(ErrorCode.DATA_NOT_FOUND);
        }

        User user = userOptional.get();
        user.updateProfileImage(newProfileImage); // Dirty Checking으로 자동 업데이트

        log.debug("프로필 사진 변경 완료: {}", newProfileImage);
    }

    // 닉네임 변경하는 메서드
    @Transactional
    public void changeUserNickname(String userCode, String newNickname) {
        Optional<User> userOptional = userRepository.findByCode(userCode);

        if (userOptional.isEmpty()) {
            throw new BusinessException(ErrorCode.DATA_NOT_FOUND);
        }

        User user = userOptional.get();
        user.updateNickname(newNickname); // Dirty Checking으로 자동 업데이트
        log.debug("닉네임 변경 완료: {}", newNickname);
    }

    // 회원 탈퇴 메서드
    @Transactional
    public void deleteUserAccount(String userCode, HttpServletRequest request, HttpServletResponse response) {
        Optional<User> userOptional = userRepository.findByCode(userCode);

        if (userOptional.isEmpty()) {
            throw new BusinessException(ErrorCode.DATA_NOT_FOUND);
        }

        userRepository.delete(userOptional.get()); // 회원 삭제
        log.debug("회원 삭제 완료 - userCode: {}", userCode);

        // 강제 logout처리
        authService.logout(request, response);
        log.debug("회원 탈퇴(강제로그아웃) 완료 - userCode: {}", userCode);
    }




}
