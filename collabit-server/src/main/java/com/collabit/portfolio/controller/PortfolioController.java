package com.collabit.portfolio.controller;

import com.collabit.global.security.SecurityUtil;
import com.collabit.portfolio.domain.dto.*;
import com.collabit.portfolio.service.PortfolioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
@Tag(name = "PortfolioController", description = "포트폴리오 API")
public class PortfolioController {
    private final PortfolioService portfolioService;

    @Operation(summary = "포트폴리오 상태 조회", description = "리포트 페이지 진입 시 필요한 포트폴리오 상태를 조회하는 API입니다.")
    @GetMapping
    public ResponseEntity<GetPortfolioStatusResponseDTO> getPortfolioStatus() {
        String userCode = SecurityUtil.getCurrentUserCode();
        GetPortfolioStatusResponseDTO responseDTO = portfolioService.getPortfolioStatus(userCode);
        return ResponseEntity.ok(responseDTO);
    }

    @Operation(summary = "포트폴리오 생성/재생성", description = "포트폴리오를 생성/재생성하는 API입니다.")
    @PostMapping
    public ResponseEntity<?> generatePortfolio() {
        String userCode = SecurityUtil.getCurrentUserCode();
        portfolioService.generatePortfolio(userCode);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "포트폴리오 정보 조회", description = "포트폴리오 조회 시 기본 정보를 조회하는 API입니다.")
    @GetMapping("/info")
    public ResponseEntity<GetPortfolioInfoResponseDTO> getPortfolioInfo() {
        String userCode = SecurityUtil.getCurrentUserCode();
        GetPortfolioInfoResponseDTO responseDTO = portfolioService.getPortfolioInfo(userCode);
        return ResponseEntity.ok(responseDTO);
    }

    @Operation(summary = "전체평균 조회", description = "메인페이지에서 전체 평균을 조회하는 API입니다.")
    @GetMapping("/main")
    public ResponseEntity<GetAverageResponseDTO> getAverage() {
        GetAverageResponseDTO responseDTO = portfolioService.getAverage();
        return ResponseEntity.ok().body(responseDTO);
    }

    @Operation(summary = "개인용 리포트 데이터 조회", description = "개인용(로그인 유저, PDF) 리포트 페이지에 들어갈 데이터를 조회하는 API입니다.")
    @GetMapping("/data")
    public ResponseEntity<GetAllPortfolioResponseDTO> getPortfolioData() {
        String userCode = SecurityUtil.getCurrentUserCode();
        GetAllPortfolioResponseDTO responseDTO = portfolioService.getAllPortfolioByLoginUser(userCode);
        return ResponseEntity.ok(responseDTO);
    }

    @Operation(summary = "공개용 포트폴리오 데이터 조회", description = "공개용 포트폴리오 들어갈 데이터를 조회하는 API입니다.")
    @GetMapping("/share/{githubId}")
    public ResponseEntity<GetAllPortfolioResponseDTO> getOpenPortfolioData(@PathVariable String githubId) {
        String decodedGithubId = portfolioService.decodeGithubId(githubId); // 해싱된 닉네임 decode
        GetAllPortfolioResponseDTO responseDTO = portfolioService.getAllPortfolioByGithubId(decodedGithubId);
        return ResponseEntity.ok(responseDTO);
    }

}

