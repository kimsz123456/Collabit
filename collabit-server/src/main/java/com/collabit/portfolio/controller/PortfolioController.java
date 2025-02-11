package com.collabit.portfolio.controller;


import com.collabit.community.service.PostService;
import com.collabit.global.security.SecurityUtil;
import com.collabit.portfolio.domain.dto.GetAverageResponseDTO;
import com.collabit.portfolio.domain.dto.GetMultipleHexagonProgressResponseDTO;
import com.collabit.portfolio.domain.dto.GetPortfolioInfoResponseDTO;
import com.collabit.portfolio.domain.dto.GetPortfolioStatusResponseDTO;
import com.collabit.portfolio.domain.dto.GetTimelineResponseDTO;
import com.collabit.portfolio.service.PortfolioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
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
    private final PostService postService;

    @Operation(summary = "포트폴리오 상태 조회", description = "리포트 페이지 진입 시 필요한 포트폴리오 상태를 조회하는 API입니다.")
    @GetMapping
    public ResponseEntity<?> getPortfolioStatus() {
        String userCode = SecurityUtil.getCurrentUserCode();
        GetPortfolioStatusResponseDTO responseDTO = portfolioService.getPortfolioStatus(userCode);
        return ResponseEntity.ok(responseDTO);
    }

    @Operation(summary = "포트폴리오 생성/재생성"
        , description = "포트폴리오를 생성/재생성하는 API입니다.")
    @PostMapping
    public ResponseEntity<?> generatePortfolio() {
        String userCode = SecurityUtil.getCurrentUserCode();
        portfolioService.generatePortfolio(userCode);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "육각형 그래프 및 상대위치 그래프 데이터 조회"
        , description = "나의 육각형 그래프 및 상대위치 그래프를 조회하는 API입니다.")
    @GetMapping("/multiple/graph")
    public ResponseEntity<GetMultipleHexagonProgressResponseDTO> getHexagonAndProgressbarGraph() {
        String userCode = SecurityUtil.getCurrentUserCode();

        return ResponseEntity.ok()
                .body(portfolioService.getHexagonAndProgressbarGraph(userCode));
    }


    @Operation(summary = "timeline 그래프 데이터 조회", description = "최근 8개 프로젝트에 대한 역량별 점수를 조회하는 API입니다.")
    @GetMapping("/multiple/timeline")
    public ResponseEntity<?> getTimelineGraph() {
        String userCode = SecurityUtil.getCurrentUserCode();
        GetTimelineResponseDTO responseDTO = portfolioService.getTimelineGraph(userCode);
        return ResponseEntity.ok(responseDTO);
    }

    @Operation(summary = "포트폴리오 정보 조회", description = "포트폴리오 조회 시 기본 정보를 조회하는 API입니다.")
    @GetMapping("/info")
    public ResponseEntity<?> getPortfolioInfo() {
        String userCode = SecurityUtil.getCurrentUserCode();
        GetPortfolioInfoResponseDTO responseDTO = portfolioService.getPortfolioInfo(userCode);
        return ResponseEntity.ok(responseDTO);
    }

    @Operation(summary = "전체평균 조회"
        , description = "메인페이지에서 전체 평균을 조회하는 API입니다.")
    @GetMapping("/main")
    public ResponseEntity<?> getAverage() {
        GetAverageResponseDTO responseDTO = portfolioService.getAverage();
        return ResponseEntity.ok().body(responseDTO);
    }
}

