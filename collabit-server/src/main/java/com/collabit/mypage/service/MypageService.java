package com.collabit.mypage.service;

import com.collabit.auth.service.AuthService;
import com.collabit.global.common.ErrorCode;
import com.collabit.global.error.exception.BusinessException;
import com.collabit.global.service.S3Service;
import com.collabit.mypage.domain.dto.ChangePasswordRequestDTO;
import com.collabit.mypage.domain.dto.MypageCurrentUserResponseDTO;
import com.collabit.mypage.domain.dto.VerifyPasswordRequestDTO;
import com.collabit.user.domain.entity.User;
import com.collabit.user.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class MypageService {
    private final UserRepository userRepository;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;
    private final RedisTemplate<String, Object> redisTemplate;
    private final S3Service s3Service;
    @Value("${default.profile.image}")
    private String defaultProfileImage;

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

    // 비밀번호 변경이 가능한 일반회원인지 체크하는 메서드
    private boolean isCommenUser(String userCode) {
        Optional<User> userOptional = userRepository.findByCode(userCode);

        if(userOptional.isEmpty()) {
            throw new BusinessException(ErrorCode.DATA_NOT_FOUND);
        }

        String githubId = userOptional.get().getGithubId();

        // githubId == null이면 일반유저
        return githubId == null;
    }

    // 현재 비밀번호가 맞는지 검증하는 메서드
    @Transactional
    public boolean verifyPassword(String userCode, VerifyPasswordRequestDTO verifyPasswordRequestDTO) {
        // 일반회원인지 확인
        if(!isCommenUser(userCode)) {
            throw new BusinessException((ErrorCode.UNAUTHORIZED));
        }

        // 사용자 조회
        Optional<User> userOptional = userRepository.findByCode(userCode);

        if (userOptional.isEmpty()) {
            throw new BusinessException(ErrorCode.DATA_NOT_FOUND);
        }

        // 현재 비밀번호가 맞는지 확인
        if(!passwordEncoder.matches(verifyPasswordRequestDTO.getCurrentPassword(), userOptional.get().getPassword()) ) {
            throw new BusinessException(ErrorCode.INVALID_PASSWORD);
        }

        // 일치한다면 비밀번호 변경가능. 임시 자격 부여
        redisTemplate.opsForValue().set("verifiedPassword:" + userCode, true, 600, TimeUnit.SECONDS);
        return true;

    }

    // 비밀번호 변경하는 메서드
    @Transactional
    public void changeUserPassword(String userCode, ChangePasswordRequestDTO changePasswordRequestDTO) {
        // 비밀번호 변경 자격이 있는지 검증
        Object isVerified = redisTemplate.opsForValue().get("verifiedPassword:"+userCode);

        if (isVerified == null || !(Boolean) isVerified) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        // 사용자 조회
        Optional<User> userOptional = userRepository.findByCode(userCode);

        if (userOptional.isEmpty()) {
            throw new BusinessException(ErrorCode.DATA_NOT_FOUND);
        }

        // 새로운 비밀번호 "암호화 후" 저장
        String encodedNewPassword = authService.encodePassword(changePasswordRequestDTO.getNewPassword());
        userOptional.get().updatePassword(encodedNewPassword); // Dirty Checking으로 자동 업데이트

        log.debug("비밀번호 변경 완료");
    }

    // 회원 탈퇴 메서드
    @Transactional
    public void deleteUserAccount(String userCode, HttpServletResponse response) {
        Optional<User> userOptional = userRepository.findByCode(userCode);

        if (userOptional.isEmpty()) {
            throw new BusinessException(ErrorCode.DATA_NOT_FOUND);
        }

        userOptional.get().resetFields();
        log.debug("회원 정보 리셋 완료 - userCode: {}", userCode);

        // 강제 logout 처리(access, refresh tokne관련 cookie삭제)
        removeAuthCookies(response);
        log.debug("회원 탈퇴(강제로그아웃) 완료 - userCode: {}", userCode);
    }

    private void removeAuthCookies(HttpServletResponse response) {
        Cookie accessTokenCookie = new Cookie("accessToken", null);
        Cookie refreshTokenCookie = new Cookie("refreshToken", null);

        accessTokenCookie.setMaxAge(0);
        refreshTokenCookie.setMaxAge(0);

        accessTokenCookie.setPath("/");
        refreshTokenCookie.setPath("/");

        response.addCookie(accessTokenCookie);
        response.addCookie(refreshTokenCookie);
    }

    // 닉네임 변경하는 메서드
    @Transactional
    public void changeUserNickname(String userCode, String newNickname) {
        // 닉네임 중복 확인
        authService.isNicknameAlreadyExists(newNickname);

        Optional<User> userOptional = userRepository.findByCode(userCode);

        if (userOptional.isEmpty()) {
            throw new BusinessException(ErrorCode.DATA_NOT_FOUND);
        }

        User user = userOptional.get();
        user.updateNickname(newNickname); // Dirty Checking으로 자동 업데이트
        log.debug("닉네임 변경 완료: {}", newNickname);
    }

    // 프로필 사진 변경하는 메서드
    @Transactional
    public String changeUserProfileImage(String userCode, MultipartFile profileImage) {
        Optional<User> userOptional = userRepository.findByCode(userCode);

        if (userOptional.isEmpty()) {
            throw new BusinessException(ErrorCode.DATA_NOT_FOUND);
        }

        User user = userOptional.get();
        // S3에서 유저가 사용하던 기존 프로필 이미지 삭제 (기본 이미지라면 삭제X)
        if (!user.getProfileImage().equals(defaultProfileImage)) {
            s3Service.delete(userOptional.get().getProfileImage());
        }

        // 새 이미지 S3에 업로드
        String newProfileImageUrl = s3Service.upload(profileImage, "profile");

        // DB에 프로필 이미지 업데이트
        user.updateProfileImage(newProfileImageUrl); // Dirty Checking으로 자동 업데이트

        log.debug("프로필 사진 변경 완료: {}", newProfileImageUrl);
        return newProfileImageUrl;
    }
}
