package com.collabit.auth.controller;

import com.collabit.auth.domain.dto.*;
import com.collabit.auth.service.AuthService;
import com.collabit.auth.service.EmailService;
import com.collabit.global.security.TokenProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "AuthController", description = "Auth(로그인, 회원가입) 관련 API")
public class AuthController {
    private final AuthService authService;
    private final EmailService emailService;
    private final TokenProvider tokenProvider;


    // 회원가입
    @Operation(summary = "일반 회원가입", description = "일반 사이트 자체 회원가입 하는 API입니다.")
    @PostMapping("/sign-up")
    public ResponseEntity<?> signUp(@Valid @RequestBody UserSignupRequestDTO userSignupRequestDTO,
                                    HttpServletRequest request) {
        log.debug("signUp Request: {}", userSignupRequestDTO.toString());

        UserResponseDTO userResponseDto = authService.signup(userSignupRequestDTO, request);
        log.debug("signUp Response: {}", userResponseDto.toString());

        return ResponseEntity.status(HttpStatus.CREATED).body(userResponseDto);
    }

    // 닉네임 중복 체크
    @Operation(summary = "회원가입시 닉네임 중복 체크", description = "회원가입 시 닉네임 중복체크 여부를 확인하는 API입니다.")
    @PostMapping("/check-nickname")
    public ResponseEntity<ApiTextResponseDTO> checkNickname(@Valid @RequestBody CheckNicknameRequestDTO checkNicknameRequestDTO) {
        String nickname = checkNicknameRequestDTO.getNickname();
        log.debug("checkNickname Request: {}", nickname);

        authService.isNicknameAlreadyExists(nickname);

        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiTextResponseDTO("사용 가능한 닉네임입니다."));
    }

    // 이메일 중복 체크
    @Operation(summary = "회원가입시 이메일 중복 체크", description = "회원가입 시 이메일 중복체크 여부를 확인하는 API입니다.")
    @PostMapping("/check-email")
    public ResponseEntity<ApiTextResponseDTO> checkEmail(@Valid @RequestBody CheckEmailRequestDTO checkEmailRequestDTO) {
        String email = checkEmailRequestDTO.getEmail();
        log.debug("checkEmail Request: {}", email);

        authService.isEmailAlreadyExists(email);

        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiTextResponseDTO("사용 가능한 이메일입니다."));

    }

    // 로그인
    @Operation(summary = "일반 로그인", description = "일반 사이트 자체 로그인 하는 API입니다." )
    @PostMapping("/login")
    public ResponseEntity<UserResponseDTO> login(@Valid @RequestBody UserLoginRequestDTO userLoginRequestDto, HttpServletResponse response) {
        log.debug("login Request: {}", userLoginRequestDto.toString());
        return ResponseEntity.ok(authService.login(userLoginRequestDto, response));
    }

    // refresh token을 통한 access token 재발급 로직
    @Operation(summary = "Access Token 재발급", description = "Refresh Token 을 사용하여 새로운 Access Token을 발급 받는 API입니다." )
    @PostMapping("/reissue")
    public ResponseEntity<Void> reissue(HttpServletRequest request, HttpServletResponse response) {
        authService.refreshAccessToken(request, response);
        return ResponseEntity.ok().build(); // 반환값 필요 없음. 쿠키에 Access Token 이 저장
    }

    // 이메일 인증 요청
    @Operation(summary = "이메일 인증 요청", description = "회원가입 시 이메일 인증을 요청하는 API입니다." )
    @PostMapping("/send-email")
    public ResponseEntity<ApiTextResponseDTO> sendEmail(@RequestBody EmailSendRequestDTO emailSendRequestDto) {
        String email = emailSendRequestDto.getEmail();
        emailService.sendMail(email);
        return ResponseEntity.ok(new ApiTextResponseDTO("인증 코드가 이메일로 전송되었습니다."));
    }

    // 이메일 인증 코드 검증
    @Operation(summary = "이메일 인증 코드 검증", description = "회원가입 시 요청한 이메일 인증코드를 검증하는 API입니다." )
    @PostMapping("/verify-email")
    public ResponseEntity<ApiTextResponseDTO> verifyEmail(@RequestBody EmailVerifyRequestDTO emailVerifyRequestDto,
                                                          HttpServletResponse response) {
        String email = emailVerifyRequestDto.getEmail();
        int code = emailVerifyRequestDto.getCode();

        String result = emailService.verifyCode(email, code);
        switch (result) {
            case "성공":
                // 이메일 인증 성공 → "이메일 검증 인증 토큰" 생성
                emailService.generateVerificationTokenEmailService(email, response);

                return ResponseEntity.ok(new ApiTextResponseDTO("이메일 인증 성공 회원가입 진행 가능"));
            case "틀림":
                return ResponseEntity.badRequest().body(new ApiTextResponseDTO("이메일 인증 실패: 코드가 틀립니다."));
            case "만료":
                return ResponseEntity.badRequest().body(new ApiTextResponseDTO("이메일 인증 실패: 코드가 만료되었습니다."));
            default:
                return ResponseEntity.badRequest().body(new ApiTextResponseDTO("알 수 없는 오류가 발생했습니다."));
        }
    }

    // 로그아웃
    @Operation(summary = "로그아웃", description = "로그아웃 하는 API입니다. ")
    @PostMapping("/logout")
    public ResponseEntity<ApiTextResponseDTO> logout(HttpServletRequest request, HttpServletResponse response) {
        authService.logout(request, response);
        return ResponseEntity.ok(new ApiTextResponseDTO("로그아웃 완료"));
    }



}
