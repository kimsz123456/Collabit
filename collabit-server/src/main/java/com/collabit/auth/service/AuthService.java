package com.collabit.auth.service;


import com.collabit.auth.domain.dto.UserSignupResponseDTO;
import com.collabit.auth.domain.dto.UserSignupRequestDTO;
import com.collabit.global.common.ErrorCode;
import com.collabit.global.error.exception.BusinessException;
import com.collabit.user.domain.entity.Role;
import com.collabit.user.domain.entity.User;
import com.collabit.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public String encodePassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }

    // 회원가입 메서드
    public UserSignupResponseDTO signup(UserSignupRequestDTO userSignupRequestDto) {
        String email = userSignupRequestDto.getEmail();
        String nickname = userSignupRequestDto.getNickname();

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
                .profileImage("기본이미지주소")
                .role(Role.ROLE_USER)
                .build();

        // 회원 저장
        userRepository.save(user);

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



