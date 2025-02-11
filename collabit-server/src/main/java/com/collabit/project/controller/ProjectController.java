package com.collabit.project.controller;

import com.collabit.global.security.SecurityUtil;
import com.collabit.project.domain.dto.*;
import com.collabit.project.domain.entity.SortOrder;
import com.collabit.project.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "ProjectController", description = "프로젝트 API")
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/api/project")
@RestController
public class ProjectController {

    private final ProjectService projectService;

    @Operation(summary = "프로젝트 등록", description = "프로젝트 정보를 등록하는 API 입니다.")
    @PostMapping
    public ResponseEntity<?> createProject(@RequestBody CreateProjectRequestDTO createProjectRequestDTO) {
        String userCode = SecurityUtil.getCurrentUserCode();

        log.info("프로젝트 등록 서비스 전달 - CreateProjectRequestDTO: {}, userCode: {}", createProjectRequestDTO.toString(), userCode);
        projectService.saveProject(createProjectRequestDTO, userCode);

        return ResponseEntity.status(201).build();
    }

    @Operation(summary = "프로젝트 목록 조회", description = "프로젝트 목록을 조회하는 API 입니다.")
    @GetMapping
    public ResponseEntity<?> getProjectList(@RequestParam(required = false) String keyword, @RequestParam(required = false, defaultValue = "LATEST") SortOrder sort) {
        String userCode = SecurityUtil.getCurrentUserCode();

        List<GetProjectListResponseDTO> projectList = projectService.findProjectList(userCode, keyword, sort);
        log.info("프로젝트 목록 데이터 반환 - 반환할 프로젝트 수: {}", projectList.size());

        return ResponseEntity.ok(projectList);
    }

    @Operation(summary = "저장된 프로젝트 목록 조회", description = "현재 DB에 있는 프로젝트(organization, title) 목록을 조회하는 API 입니다.")
    @GetMapping("/added")
    public ResponseEntity<?> getAddedProjectList() {
        String userCode = SecurityUtil.getCurrentUserCode();

        List<GetAddedProjectListResponseDTO> addedProjectList = projectService.findAddedProjectList(userCode);
        log.info("저장된 프로젝트 목록 데이터 반환 - 반환할 프로젝트 수: {}", addedProjectList.size());

        return ResponseEntity.ok(addedProjectList);
    }

    @Operation(summary = "메인 페이지 프로젝트 목록 조회", description = "메인페이지에 보여줄 프로젝트 목록을 조회하는 API 입니다.")
    @GetMapping("/list/main")
    public ResponseEntity<?> getMainProjectList() {
        String userCode = SecurityUtil.getCurrentUserCode();

        List<GetMainProjectListResponseDTO> projectList = projectService.findMainProjectList(userCode);
        log.info("메인 페이지 프로젝트 목록 데이터 반환 - 반환할 프로젝트 수: {}", projectList.size());

        return ResponseEntity.ok(projectList);
    }

    @Operation(summary = "프로젝트 설문 마감", description = "로그인 사용자의 특정 프로젝트를 마감하는 API 입니다.")
    @PatchMapping("/done/{code}")
    public ResponseEntity<?> closeProjectSurvey(@PathVariable int code) {
        String userCode = SecurityUtil.getCurrentUserCode();

        projectService.updateProjectSurveyState(userCode, code);
        log.debug("해당 프로젝트 설문 마감 완료 - 설문 마감한 프로젝트 code: {}", code);

        return ResponseEntity.ok().build();
    }

    @Operation(summary = "프로젝트 삭제", description = "설문 참여자가 없는 특정 프로젝트를 삭제하는 API 입니다.")
    @DeleteMapping("/{code}")
    public ResponseEntity<?> deleteProject(@PathVariable int code) {
        String userCode = SecurityUtil.getCurrentUserCode();

        projectService.removeProject(userCode, code);
        log.debug("프로젝트 삭제 완료 - 삭제된 프로젝트 code: {}", code);

        return ResponseEntity.ok().build();
    }

    @Operation(summary = "프로젝트별 결과의 육각형 그래프 조회", description = "프로젝트별 결과 모달창의 육각형 그래프를 조회하는 API 입니다.")
    @GetMapping("/graph/hexagon/{code}")
    public ResponseEntity<?> getHexagonGraph(@PathVariable int code) {
        GetHexagonResponseDTO responseDTO = projectService.getHexagonGraph(code);
        log.debug("육각형 그래프 데이터 조회 완료");
        return ResponseEntity.ok(responseDTO);
    }
}
