package com.collabit.mypage.controller;

import com.collabit.auth.domain.dto.ApiTextResponseDTO;
import com.collabit.global.security.SecurityUtil;
import com.collabit.mypage.domain.dto.*;
import com.collabit.mypage.service.MypageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    @Operation(summary="마이페이지 유저 비밀번호 변경을 위해 현재 비밀번호 검증", description ="마이페이지에서 비밀번호를 변경하기 위한 임시토큰을 발급받는 API입니다.")
    @PostMapping("/password")
    public ResponseEntity<ApiTextResponseDTO> verifyCurrentPasswordForChange(@RequestBody VerifyPasswordRequestDTO verifyPasswordRequestDTO) {
        String userCode = SecurityUtil.getCurrentUserCode();
        log.debug("getCurrentUser: {}", userCode);

        boolean isVerified = mypageService.verifyPassword(userCode, verifyPasswordRequestDTO);
        if(isVerified){
            return ResponseEntity.ok(new ApiTextResponseDTO("비밀번호 변경을 위한 임시 자격이 발급되었습니다."));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiTextResponseDTO("현재 비밀번호가 틀립니다."));
        }
    }

    @Operation(summary="마이페이지 유저 비밀번호 변경", description ="마이페이지에서 비밀번호를 변경하는 API입니다.")
    @PatchMapping("/password")
    public ResponseEntity<ApiTextResponseDTO> changePassword(@RequestBody ChangePasswordRequestDTO changePasswordRequestDTO) {
        String userCode = SecurityUtil.getCurrentUserCode();
        log.debug("getCurrentUser: {}", userCode);

        mypageService.changeUserPassword(userCode, changePasswordRequestDTO);
        return ResponseEntity.ok(new ApiTextResponseDTO("비밀번호가 변경되었습니다."));
    }

    @Operation(summary="마이페이지 프로필 사진 변경", description ="마이페이지에서 프로필 사진을 변경하는 API입니다.")
    @PatchMapping("/image")
    public ResponseEntity<ApiTextResponseDTO> changeProfileImage(@ModelAttribute ChangeProfileImageRequestDTO changeProfileImageRequestDTO) {
        String userCode = SecurityUtil.getCurrentUserCode();
        MultipartFile newProfileImage = changeProfileImageRequestDTO.getNewProfileImage(); // 요청으로 받은 새 이미지 URL

        log.debug("changeProfileImage - userCode: {}, newProfileImage: {}", userCode, newProfileImage);

        String newProfileImageUrl = mypageService.changeUserProfileImage(userCode, newProfileImage);
        return ResponseEntity.ok(new ApiTextResponseDTO("프로필 사진 변경이 완료. 새 이미지 주소: " + newProfileImageUrl));
    }

    @Operation(summary="마이페이지 닉네임 변경", description ="마이페이지에서 닉네임을 변경하는 API입니다.")
    @PatchMapping("/nickname")
    public ResponseEntity<ApiTextResponseDTO> changeNickname(@RequestBody ChangeNicknameRequestDTO changeNicknameRequestDTO) {
        String userCode = SecurityUtil.getCurrentUserCode();
        String newNickname = changeNicknameRequestDTO.getNickname(); // 요청으로 받은 새 닉네임

        log.debug("changeNickname - userCode: {}, newNickname: {}", userCode, newNickname);

        mypageService.changeUserNickname(userCode, newNickname);
        return ResponseEntity.ok(new ApiTextResponseDTO(newNickname+ ": 닉네임 변경이 완료되었습니다."));
    }

    @Operation(summary="회원 탈퇴", description ="사용자의 계정을 삭제하는 API입니다.")
    @DeleteMapping("")
    public ResponseEntity<ApiTextResponseDTO> deleteUser(HttpServletResponse response) {
        String userCode = SecurityUtil.getCurrentUserCode();

        log.debug("deleteUser - userCode: {}", userCode);

        mypageService.deleteUserAccount(userCode, response);
        return ResponseEntity.ok(new ApiTextResponseDTO("회원 탈퇴가 완료되었습니다."));
    }



}
