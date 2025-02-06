package com.collabit.survey.controller;

import com.collabit.global.security.SecurityUtil;
import com.collabit.survey.domain.dto.*;
import com.collabit.survey.service.SurveyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/survey")
@RequiredArgsConstructor
@Tag(name = "SurveyController", description = "객관식 설문 질문문항/답변 관련 API")
public class SurveyController {
    private final SurveyService surveyService;

    @GetMapping
    @Operation(summary="설문 리스트 조회", description = "참여 전/후의 설문 리스트를 조회하는 API입니다.")
    public ResponseEntity<List<SurveyListResponseDTO>> getSurveyList() {
        String userCode = SecurityUtil.getCurrentUserCode();
        List<SurveyListResponseDTO> responseDTO = surveyService.getSurveyList(userCode);
        if (responseDTO.isEmpty()) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(responseDTO);
    }

    @GetMapping("/question")
    @Operation(summary="객관식 질문 24개 조회", description = "객관식 설문 질문 문항 전체 24개를 조회하는 API 입니다.")
    public ResponseEntity<List<SurveyQuestionResponseDTO>> findAllQuestions() {
        return ResponseEntity.ok(surveyService.getAllQuestions());
    }

    @PostMapping("/{surveyCode}/multiple")
    @Operation(summary="객관식 설문 답변 저장", description = "24개의 객관식 설문 답변내용을 mongoDB에 저장하는 API 입니다.")
    public ResponseEntity<ApiTextResponseDTO> saveMultipleResponse(
            @PathVariable int surveyCode,
            @RequestBody @Valid SurveyMultipleRequestDTO requestDTO) {
        String userCode = SecurityUtil.getCurrentUserCode();
        List<Integer> scores = requestDTO.getScores();
        surveyService.saveResponse(userCode, surveyCode, scores);
        return ResponseEntity.ok(new ApiTextResponseDTO("설문 응답이 성공적으로 저장되었습니다."));
    }

    @GetMapping("/{surveyCode}")
    @Operation(summary="설문조사 디테일 조회", description = "설문조사의 모든 답변내용을 조회하는 API입니다.")
    public ResponseEntity<?> getSurveyDetail(@PathVariable int surveyCode) {
        String userCode = SecurityUtil.getCurrentUserCode();
        SurveyDetailResponseDTO responseDTO = surveyService.getSurveyDetail(userCode, surveyCode);
        log.debug("surveyResponse: {}", responseDTO);
        return ResponseEntity.ok(responseDTO);
    }
}
