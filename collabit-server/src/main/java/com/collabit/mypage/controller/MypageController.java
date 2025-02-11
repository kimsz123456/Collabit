package com.collabit.mypage.controller;

import com.collabit.global.security.SecurityUtil;
import com.collabit.mypage.domain.dto.MypageCurrentUserDTO;
import com.collabit.mypage.service.MypageService;
import com.collabit.user.domain.dto.GetCurrentUserResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@Tag(name = "MypageController", description="Mypage 관련 API입니다.")
@RequestMapping("/api/user")
public class MypageController {
    private final MypageService mypageService;

    @Operation(summary="마이페이지 유저 정보 조회",description = "마이페이지에 필요한 유저 정보를 반환하는 API입니다.")
    @GetMapping("/mypage")
    public ResponseEntity<MypageCurrentUserDTO> getCurrentUser() {
        String userCode = SecurityUtil.getCurrentUserCode();
        log.debug("getCurrentUser: {}", userCode);

        MypageCurrentUserDTO mypageCurrentUserDTO = mypageService.getCurrentUserInfoMypage(userCode);
        log.debug("MypageCurrentUserDTO: {}", mypageCurrentUserDTO.toString());
        return ResponseEntity.ok(mypageCurrentUserDTO);
    }

}
