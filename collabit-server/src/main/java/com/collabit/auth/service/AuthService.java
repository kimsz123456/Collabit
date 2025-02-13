package com.collabit.auth.service;


import com.collabit.auth.domain.dto.ApiTextResponseDTO;
import com.collabit.auth.domain.dto.UserSignupResponseDTO;
import com.collabit.auth.domain.dto.UserSignupRequestDTO;
import com.collabit.global.common.ErrorCode;
import com.collabit.global.error.exception.BusinessException;
import com.collabit.global.service.RedisService;
import com.collabit.user.domain.entity.Role;
import com.collabit.user.domain.entity.User;
import com.collabit.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RedisService redisService;
    @Value("${default.profile.image}")
    private String defaultProfileImage;

    public String encodePassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }

    // 회원가입 메서드
    public UserSignupResponseDTO signup(UserSignupRequestDTO userSignupRequestDto) {
        String email = userSignupRequestDto.getEmail();
        String nickname = userSignupRequestDto.getNickname();

        // 이메일 인증 여부 확인
        String verifiedKey = "verifiedEmailCode:" + email;
        Object isVerified = redisService.get(verifiedKey);
        if (isVerified == null || !(Boolean) isVerified) {
            throw new BusinessException(ErrorCode.EMAIL_NOT_VERIFIED);
        }

        // 이메일 중복체크
        isEmailAlreadyExists(email);

        // 닉네임 중복체크
        isNicknameAlreadyExists(nickname);

        // 비밀번호 암호화
        String encodedPassword = encodePassword((userSignupRequestDto.getPassword()));

        // 회원 정보 생성
        User user = User.builder()
                .email(userSignupRequestDto.getEmail())
                .password(encodedPassword)
                .nickname(userSignupRequestDto.getNickname())
                .profileImage(defaultProfileImage)
                .role(Role.ROLE_USER)
                .build();

        // 회원 저장
        userRepository.save(user);

        // 이메일 인증 여부 Redis에서 삭제 (더 이상 필요 없음)
        redisService.delete(email);

        // UserResponseDto 생성(FE 에게 정보 전달 용)
        // isGithub 은 회원가입시에는 false. 로그인 때 확인
        return UserSignupResponseDTO.builder()
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

}



