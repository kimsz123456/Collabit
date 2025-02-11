package com.collabit.mypage.controller;

import com.collabit.auth.domain.dto.ApiTextResponseDTO;
import com.collabit.global.security.SecurityUtil;
import com.collabit.mypage.domain.dto.ChangePasswordRequestDTO;
import com.collabit.mypage.domain.dto.GeneratePasswordChangeTokenRequestDTO;
import com.collabit.mypage.domain.dto.MypageCurrentUserResponseDTO;
import com.collabit.mypage.service.MypageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@Tag(name = "MypageController", description="Mypage 관련 API입니다.")
@RequestMapping("/api/user")
public class MypageController {
    private final MypageService mypageService;

    @Operation(summary="마이페이지 유저 정보 조회",description = "마이페이지에 필요한 유저 정보를 반환하는 API입니다.")
    @GetMapping("/mypage")
    public ResponseEntity<MypageCurrentUserResponseDTO> getCurrentUser() {
        String userCode = SecurityUtil.getCurrentUserCode();
        log.debug("getCurrentUser: {}", userCode);

        MypageCurrentUserResponseDTO mypageCurrentUserResponseDTO = mypageService.getCurrentUserInfoMypage(userCode);
        log.debug("MypageCurrentUserResponseDTO: {}", mypageCurrentUserResponseDTO.toString());
        return ResponseEntity.ok(mypageCurrentUserResponseDTO);
    }

    @Operation(summary="마이페이지 유저 비밀번호 변경을 위해 현재 비밀번호를 -검증-.", description ="마이페이지에서 비밀번호를 변경하기 위한 임시토큰을 발급받는 API입니다.")
    @PostMapping("/password-check")
    public ResponseEntity<ApiTextResponseDTO> verifyCurrentPasswordForChange(@RequestBody GeneratePasswordChangeTokenRequestDTO generatePasswordChangeTokenRequestDTO,
                                                             HttpServletResponse response) {
        String userCode = SecurityUtil.getCurrentUserCode();
        log.debug("getCurrentUser: {}", userCode);

        mypageService.generatePasswordChangeTokenMypageService(userCode, response);
        return ResponseEntity.ok(new ApiTextResponseDTO("비밀번호 변경을 위한 임시 토큰이 발급되었습니다."));

    }

    @Operation(summary="마이페이지 유저 비밀번호 변경", description ="마이페이지에서 비밀번호를 변경하는 API입니다.")
    @PatchMapping("/password-change")
    public ResponseEntity<ApiTextResponseDTO> changePassword(@RequestBody ChangePasswordRequestDTO changePasswordRequestDTO
    , HttpServletRequest request) {
        String userCode = SecurityUtil.getCurrentUserCode();
        log.debug("getCurrentUser: {}", userCode);

        mypageService.changeUserPassword(userCode, changePasswordRequestDTO, request);
        return ResponseEntity.ok(new ApiTextResponseDTO("비밀번호가 변경되었습니다."));


    }

}
