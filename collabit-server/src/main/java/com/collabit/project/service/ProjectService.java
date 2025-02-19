package com.collabit.project.service;

import com.collabit.global.common.ErrorCode;
import com.collabit.global.error.exception.BusinessException;
import com.collabit.portfolio.domain.dto.ScoreData;
import com.collabit.portfolio.domain.entity.Description;
import com.collabit.portfolio.domain.entity.Feedback;
import com.collabit.portfolio.domain.entity.Portfolio;
import com.collabit.portfolio.repository.DescriptionRepository;
import com.collabit.portfolio.repository.FeedbackRepository;
import com.collabit.portfolio.repository.PortfolioRepository;
import com.collabit.project.domain.dto.*;
import com.collabit.project.domain.entity.*;
import com.collabit.project.exception.ProjectInfoNotFoundException;
import com.collabit.project.repository.*;
import com.collabit.survey.repository.SurveyMultipleRepository;
import com.collabit.user.domain.entity.User;
import com.collabit.user.exception.UserNotFoundException;
import com.collabit.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@Transactional
@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectInfoRepository projectInfoRepository;
    private final ContributorRepository contributorRepository;
    private final ProjectContributorRepository projectContributorRepository;
    private final UserRepository userRepository;
    private final ProjectRedisService projectRedisService;
    private final TotalScoreRepository totalScoreRepository;
    private final DescriptionRepository descriptionRepository;
    private final PortfolioRepository portfolioRepository;
    private final FeedbackRepository feedbackRepository;
    private final SurveyMultipleRepository surveyMultipleRepository;
    private final ProjectSseEmitterService projectSseEmitterService;

    @Value("${minimum.create.condition}")
    private int minimumCreateCondition;

    @Value("${minimum.done.condition}")
    private int minimumDoneCondition;

    // User 검증 메소드
    private User findUserByCode(String userCode) {
        User user = userRepository.findByCode(userCode)
                .orElseThrow(UserNotFoundException::new);
        log.debug("사용자 조회 완료 - userCode: {}", userCode);
        return user;
    }

    // ProjectInfo 검증 메소드
    private ProjectInfo validateProjectInfo(String userCode, int code) {
        ProjectInfo projectInfo = projectInfoRepository.findByCode(code);

        if(projectInfo == null) {
            log.error("code로 projectInfo를 조회할 수 없음");
            throw new RuntimeException("해당 프로젝트가 존재하지 않습니다.");
        }

        if(!projectInfo.getUser().getCode().equals(userCode)) {
            log.error("로그인 유저가 해당 프로젝트의 등록자가 아님 - 로그인 유저: {}, 프로젝트의 유저: {}",
                    userCode, projectInfo.getUser().getCode());
            throw new RuntimeException("해당 프로젝트에 대한 권한이 없습니다.");
        }

        return projectInfo;
    }

    // ProjectInfo 중복 검증 메소드
    private void validateProjectInfoNotExists(int projectCode, String userCode) {
        ProjectInfo existingProjectInfo = projectInfoRepository.findByProjectCodeAndUserCode(projectCode, userCode);
        if(existingProjectInfo != null) {
            log.warn("이미 등록된 프로젝트 정보 발견 - projectCode: {}, projectInfoCode: {}, userCode: {}",
                    projectCode, existingProjectInfo.getCode(), userCode);
            throw new RuntimeException("이미 등록하신 레포지토리입니다.");
        }
    }

    // 프론트에서 받은 프로젝트 정보 검증 후 프로젝트 저장
    public void saveProject(CreateProjectRequestDTO createProjectRequestDTO, String userCode) {
        log.info("프로젝트 등록 시작 - CreateProjectRequestDTO: {}, userCode: {}", createProjectRequestDTO.toString(), userCode);

        if (createProjectRequestDTO.getContributors().isEmpty()) {
            throw new BusinessException(ErrorCode.EMPTY_CONTRIBUTOR_LIST);
        }

        // 1. 시용자 조회
        User user = findUserByCode(userCode);

        // 2. Project가 없는 경우 저장
        Project project = projectRepository.findByTitleAndOrganization(
                createProjectRequestDTO.getTitle(),
                createProjectRequestDTO.getOrganization());

        if (project == null) {
            project = Project.builder()
                    .title(createProjectRequestDTO.getTitle())
                    .organization(createProjectRequestDTO.getOrganization())
                    .organizationImage(createProjectRequestDTO.getOrganizationImage())
                    .build();
            project = projectRepository.save(project);
            log.debug("새 프로젝트 저장 완료 - projectCode: {}", project.getCode());
        } else {
            log.debug("기존 프로젝트 발견 - projectCode: {}, title: {}, organization: {}",
                    project.getCode(), project.getTitle(), project.getOrganization());

            // 기존에 있던 organization 이미지 변경이 발생한 경우 이미지 업데이트
            if (!project.getOrganizationImage().equals(createProjectRequestDTO.getOrganizationImage())) {
                project.updateOrganizationImage(createProjectRequestDTO.getOrganizationImage());
                project = projectRepository.save(project);
                log.debug("기존 프로젝트의 organization 이미지 업데이트");
            }
        }

        // 3. ProjectInfo 저장
        // 현재 로그인 유저가 해당 레포지토리를 저장한적 있는지 검증 (projectCode, userCode로 조회)
        validateProjectInfoNotExists(project.getCode(), userCode);

        // 등록되지 않은 레포지토리의 정보를 ProjectInfo에 저장
        ProjectInfo projectInfo = ProjectInfo.builder()
                .project(project)
                .user(user)
                .total(createProjectRequestDTO.getContributors().size() - 1) // 본인 제외
                .build();
        projectInfo = projectInfoRepository.save(projectInfo);
        log.debug("ProjectInfo 저장 완료 - projectInfoCode: {}", projectInfo.getCode());

        // 4. Contributor 처리
        // 다른 유저가 이미 저장했던 레포지토리를 저장할 경우 동일한 contributor 정보 사용
        // -> 중복 저장하지 않기 위해 해당 project에 저장되어 있는 contributor 정보 조회
        List<ProjectContributor> existingContributors = projectContributorRepository
                .findByProject(project);
        log.debug("기존 컨트리뷰터 조회 완료 - projectCode: {}, 기존 컨트리뷰터 수: {}",
                project.getCode(), existingContributors.size());

        // 로그인 user는 해당 projectInfo의 contributor에 포함하지 않음
        List<ContributorDetailDTO> filteredContributors = createProjectRequestDTO.getContributors().stream()
                .filter(contributor -> !contributor.getGithubId().equals(user.getGithubId()))
                .toList();

        // FE에서 받아온 contributor와 저장된 contributor를 비교하여 중복되지 않은 contributor만 저장
        for (ContributorDetailDTO contributorDetailDTO : filteredContributors) {
            boolean exists = existingContributors.stream()
                    .anyMatch(pc -> pc.getId().getGithubId().equals(contributorDetailDTO.getGithubId()));

            // 현재 DB에 해당 project 소속으로 없는 contributor인 경우
            if (!exists) {
                // Contributor 테이블에서 조회 (다른 프로젝트의 contributor로 등록되어 있을 수 있음)
                Contributor contributor = contributorRepository
                        .findByGithubId(contributorDetailDTO.getGithubId())
                        .orElse(null);

                // 다른 프로젝트에도 소속되어 있지 않는 경우 contributor 저장
                if (contributor == null) {
                    contributor = Contributor.builder()
                            .githubId(contributorDetailDTO.getGithubId())
                            .profileImage(contributorDetailDTO.getProfileImage())
                            .build();
                    contributor = contributorRepository.save(contributor);
                    log.debug("새 컨트리뷰터 저장 - githubId: {}", contributor.getGithubId());
                } else {
                    log.debug("기존 컨트리뷰터 발견 - githubId: {}", contributor.getGithubId());
                    // 기존에 있던 contributor의 프로필 이미지 변경이 발생한 경우 이미지 업데이트
                    if (!contributorDetailDTO.getProfileImage().equals(contributor.getProfileImage())) {
                        contributor.updateProfileImage(contributorDetailDTO.getProfileImage());
                        contributorRepository.save(contributor);
                        log.debug("기존 contributor의 프로필 이미지 업데이트");
                    }
                }

                // 해당 project 소속으로 없는 contributor이므로 ProjectContributor에 관계 저장
                ProjectContributorId projectContributorId = new ProjectContributorId(
                        project.getCode(),
                        projectInfo.getCode(),
                        contributor.getGithubId()
                );

                ProjectContributor projectContributor = ProjectContributor.builder()
                        .id(projectContributorId)
                        .project(project)
                        .projectInfo(projectInfo)
                        .contributor(contributor)
                        .build();

                projectContributorRepository.save(projectContributor);
                log.debug("ProjectContributor 관계 저장 완료 - projectCode: {}, projectInfoCode: {}, githubId: {}",
                        project.getCode(), projectInfo.getCode(), contributor.getGithubId());
            }
        }

        // 레디스에 설문조사 요청을 저장
        saveNewSurveyRequestForRedis(filteredContributors, projectInfo.getCode());

        log.info("프로젝트 등록 완료 - projectCode: {}, projectInfoCode: {}, 컨트리뷰터 수: {}",
                project.getCode(), projectInfo.getCode(), filteredContributors.size());
    }

    private void saveNewSurveyRequestForRedis(List<ContributorDetailDTO> contributors, Integer projectInfoCode) {
        log.debug("설문 요청 처리 시작 - 컨트리뷰터 수: {}", contributors.size());

        for (ContributorDetailDTO contributor : contributors) {
            // 각 깃허브 아이디로 유저 조회
            User user = userRepository.findByGithubId(contributor.getGithubId())
                    .orElse(null);

            // 유저가 존재하면 Redis에 키 등록
            if (user != null) {
                projectRedisService.saveNewSurveyRequest(user.getCode(), projectInfoCode);
                log.debug("설문 요청 등록 완료 - userCode: {}, projectInfoCode: {}",
                        user.getCode(), projectInfoCode);
            }
        }
    }

    // 로그인 유저의 전체 프로젝트 조회
    public List<GetProjectListResponseDTO> findProjectList(String userCode, String keyword, SortOrder sortOrder) {
        log.info("프로젝트 목록 조회 시작 - userCode: {}, keyword: {}, sortOrder: {}",
                userCode, keyword, sortOrder);

        User user = findUserByCode(userCode);

        // 1. 로그인 유저의 ProjectInfo 리스트 조회
        // project와 함께 조회하여 N+1 문제 방지 (후에 project 테이블에 있는 정보 조회 시 발생)
        List<ProjectInfo> projectInfoList = projectInfoRepository.findByUserCodeWithProject(userCode);
        log.debug("사용자의 ProjectInfo 조회 완료 - 조회된 ProjectInfo 수: {}", projectInfoList.size());

        // 2. 키워드 검색 적용
        if (keyword != null && !keyword.trim().isEmpty()) {
            projectInfoList = projectInfoList.stream()
                    .filter(pi -> pi.getProject().getTitle().toLowerCase()
                            .contains(keyword.toLowerCase()))
                    .toList();
            log.debug("키워드 검색 적용 후 ProjectInfo 수: {}", projectInfoList.size());
        }

        // 3. organization별로 그룹핑
        Map<String, List<ProjectInfo>> groupedByOrg = projectInfoList.stream()
                .collect(Collectors.groupingBy(pi -> pi.getProject().getOrganization()));

        // 4. Redis에서 newSurveyResponse 정보를 한 번에 조회
        Map<Integer, Integer> newSurveyResponseMap = projectRedisService.findNewSurveyResponsesByUserCode(userCode);

        // 5. organizaion으로 묶은 ProjectInfo 리스트를 기반으로 Project 정보와 Contributor 정보를 조회 후 DTO 매핑
        List<GetProjectListResponseDTO> result = groupedByOrg.entrySet().stream()
                .map(entry -> {
                    String org = entry.getKey();
                    List<ProjectInfo> orgProjects = entry.getValue();
                    Project firstProject = orgProjects.get(0).getProject(); // 그룹내 organization은 모두 동일하여 1개만 저장

                    List<ProjectDetailDTO> projects = orgProjects.stream()
                            .map(projectInfo -> {
                                Project project = projectInfo.getProject();

                                // contributor 정보 조회 (같은 project의 해당 projectInfo 이전의 모든 contributor 조회)
                                List<String> contributorsGithubId = projectContributorRepository
                                        .findByProjectCodeAndProjectInfoCodeLessThanEqual(
                                                project.getCode(),
                                                projectInfo.getCode()
                                        )
                                        .stream()
                                        .filter(githubId -> !githubId.equals(user.getGithubId())) // 현재 사용자 제외
                                        .collect(Collectors.toList());

                                // 조회한 contributor들의 githubId, 프로필 이미지 조회
                                List<ContributorDetailDTO> contributors = contributorRepository
                                        .findByGithubIdIn(contributorsGithubId)
                                        .stream()
                                        .map(contributor -> ContributorDetailDTO.builder()
                                                .githubId(contributor.getGithubId())
                                                .profileImage(contributor.getProfileImage())
                                                .build())
                                        .collect(Collectors.toList());

                                int nowParticipant = projectInfo.getParticipant() + newSurveyResponseMap.getOrDefault(projectInfo.getCode(), 0);

                                return ProjectDetailDTO.builder()
                                        .code(projectInfo.getCode())
                                        .title(project.getTitle())
                                        .isDone(projectInfo.getCompletedAt() != null)
                                        .participant(nowParticipant)
                                        .newSurveyResponse(newSurveyResponseMap.containsKey(projectInfo.getCode()))
                                        .createdAt(projectInfo.getCreatedAt())
                                        .contributors(contributors)
                                        .participationRate(calculateParticipationRate(projectInfo, nowParticipant))
                                        .build();
                            })

                            // isDone=false인 것이 앞에 오도록 정렬, isDone이 같을 때 code 내림차순 정렬
                            .sorted(Comparator
                                    .comparing(ProjectDetailDTO::isDone)
                                    .thenComparing((p1, p2) -> {
                                        if (sortOrder == SortOrder.PARTICIPATION) {
                                            return Double.compare(p2.getParticipationRate(), p1.getParticipationRate());
                                        }
                                        return Integer.compare(p2.getCode(), p1.getCode());
                                    }))
                            .collect(Collectors.toList());

                    return GetProjectListResponseDTO.builder()
                            .organization(org)
                            .organizationImage(firstProject.getOrganizationImage())
                            .projects(projects)
                            .build();
                })
                .collect(Collectors.toList());
        log.info("로그인 유저의 전체 프로젝트 목록 조회 완료 - 조회된 organization 수: {}", result.size());

        removeAllNotification(userCode);
        log.debug("전체 목록 조회 시 Redis의 모든 알림 정보를 삭제 완료");

        return result;
    }

    // 참여율 계산 메소드
    private double calculateParticipationRate(ProjectInfo projectInfo, int nowParticipant) {
        double rate = projectInfo.getTotal() == 0 ? 0 :
                (double) nowParticipant / projectInfo.getTotal() * 100;
        return Math.round(rate * 10.0) / 10.0; // 소수점 첫째자리 반올림
    }

    // 로그인 유저가 저장한 프로젝트 리스트 조회
    @Transactional(readOnly = true)
    public List<GetAddedProjectListResponseDTO> findAddedProjectList(String userCode) {
        // 1. 로그인 유저의 ProjectInfo 리스트 조회
        List<ProjectInfo> projectInfoList = projectInfoRepository.findByUserCodeWithProject(userCode);
        log.debug("사용자의 ProjectInfo 조회 완료 - 조회된 ProjectInfo 수: {}", projectInfoList.size());

        // 2. ProjectInfo로 Project 정보 추출해 DTO에 매핑 후 반환
        List<GetAddedProjectListResponseDTO> result = projectInfoList.stream()
                .map(pi -> GetAddedProjectListResponseDTO.builder()
                        .code(pi.getCode())
                        .organization(pi.getProject().getOrganization())
                        .title(pi.getProject().getTitle())
                        .build()
                ).toList();
        log.debug("사용자의 ProjectInfo 정보로 Project 정보 조회 후 매핑 완료 - 매핑된 Project 수: {}", result.size());

        return result;
    }

    // 프로젝트 설문조사 마감
    public void updateProjectSurveyState(String userCode, int projectInfoCode) {
        // 해당 projectInfo가 현재 로그인된 user의 소유가 맞는지 검증
        ProjectInfo projectInfo = validateProjectInfo(userCode, projectInfoCode);

        if (projectInfo.getCompletedAt() != null) {
            log.error("completedAt에 날짜가 있는 경우 - 해당 ProjectInfo의 completedAt: {}", projectInfo.getCompletedAt());
            throw new RuntimeException("해당 프로젝트의 설문조사는 이미 마감되었습니다.");
        }

        // Redis에 남아있는 알림 정보, 업데이트 되지 않은 참여자 업데이트
        removeAllNotification(userCode);

        // 설문 참여자가 전체 컨트리뷰터 수의 1/2 이상일 경우에만 마감 가능
        if(projectInfo.getParticipant() < minimumDoneCondition) { // projectInfo.getTotal()/2
            log.error("설문 참여자가 부족한 경우 - 해당 ProjectInfo의 participant 수: {}, total 수: {}", projectInfo.getParticipant(), projectInfo.getTotal());
            throw new RuntimeException("해당 프로젝트의 설문 참여자 수가 부족합니다. 전체 인원의 반 이상이 참여해야 마감이 가능합니다.");
        }

        // 설문조사 마감 시간 업데이트
        log.debug("해당 프로젝트 설문조사 마감 시작 - 현재 completedAt: {}", (Object) null);
        projectInfo.completeSurvey();
        projectInfoRepository.save(projectInfo);
        log.debug("해당 프로젝트 설문조사 마감 완료 - 현재 completedAt: {}", projectInfo.getCompletedAt());

        // 포트폴리오가 있는 경우 isUpdate 갱신
        portfolioRepository.findById(userCode).ifPresent(portfolio -> enablePortfolioUpdate(userCode));

        // 마감된 해당 프로젝트의 객관식 점수, 참여자 수 업데이트
        updateAllUserScore(projectInfo);
    }

    // 프로젝트 완료 시 갱신 여부 업데이트
    public void enablePortfolioUpdate(String userCode) {
        Portfolio portfolio = portfolioRepository.findById(userCode)
                .orElseThrow(() -> new RuntimeException("아직 포트폴리오가 생성되지 않았습니다."));

        // 해당 유저의 마감된 projectInfo 리스트
        List<ProjectInfo> completedProjectList = projectInfoRepository.findByUser_CodeAndCompletedAtIsNotNull(userCode);
        int totalParticipant = calTotalParticipant(completedProjectList);

        // 포트폴리오 갱신 가능 여부
        boolean isUpdate = canUpdatePortfolio(portfolio, totalParticipant);

        if (isUpdate) {
            portfolio.changeUpdateStatus();
            portfolioRepository.save(portfolio);
        }
    }

    private int calTotalParticipant(List<ProjectInfo> completedProjectList){
        return completedProjectList.stream()
                .mapToInt(ProjectInfo::getParticipant)
                .sum();
    }

    public boolean canUpdatePortfolio(Portfolio portfolio, int participant) {
        boolean isUpdate = false;
        // 포트폴리오가 아직 생성 전이면 6명 이상인지 확인
        if(portfolio == null && participant >= minimumCreateCondition){
            isUpdate = true;
        }
        // 포트폴리오가 이미 생성되었다면 포트폴리오 테이블의 isUpdate도 확인
        else if(portfolio != null && portfolio.getIsUpdate() && participant >= minimumCreateCondition + portfolio.getParticipant()){
            isUpdate = true;
        }
        return isUpdate;
    }

    private void updateAllUserScore(ProjectInfo projectInfo){
        TotalScore totalScore = totalScoreRepository.findAll().get(0);

        totalScore = TotalScore.builder()
                .code(totalScore.getCode())
                .totalParticipant(totalScore.getTotalParticipant() + projectInfo.getParticipant())
                .sympathy(totalScore.getSympathy() + projectInfo.getSympathy())
                .listening(totalScore.getListening() + projectInfo.getListening())
                .expression(totalScore.getExpression() + projectInfo.getExpression())
                .problemSolving(totalScore.getProblemSolving() + projectInfo.getProblemSolving())
                .conflictResolution(totalScore.getConflictResolution() + projectInfo.getConflictResolution())
                .leadership(totalScore.getLeadership() + projectInfo.getLeadership())
                .build();

        totalScoreRepository.save(totalScore);
    }

    // 해당 프로젝트 설문에 참여한 사람이 없을 경우 프로젝트 삭제
    public void removeProject(String userCode, int code) {
        // 삭제할 projectInfo가 현재 로그인된 user의 소유가 맞는지 검증
        ProjectInfo projectInfo = validateProjectInfo(userCode, code);

        // 설문 참여자가 있거나 마감됐을 경우 삭제 불가
        if(projectInfo.getCompletedAt() != null || projectInfo.getParticipant() >= 1) {
            log.error("설문 참여자가 있거나 설문이 마감됐을 경우 삭제 불가");
            throw new RuntimeException("설문 참여자가 있거나 설문을 마감하였을 경우 삭제가 불가능합니다.");
        }

        // projectInfo에 해당하는 contributor 조회
        List<ProjectContributor> contributors = projectContributorRepository.findByProjectInfoCode(code);

        // 해당 projectInfo와 같은 project에 소속된 projectInfo 조회 (없을 경우 삭제 시 project 정보도 함께 삭제)
        List<ProjectInfo> projectInfoList = projectInfoRepository.findByProjectCodeOrderByCodeAsc(projectInfo.getProject().getCode());

        // contributor의 경우 다른 프로젝트에서 사용될 수 있으므로 보존
        // 1. project에 해당 projectInfo만 있는 경우 -> project, projectInfo 삭제
        if (projectInfoList.size() <= 1) {
            log.info("project에 해당 projectInfo만 있는 경우 - projectInfo 수: {}", projectInfoList.size());
            projectContributorRepository.deleteByProjectCode(projectInfo.getProject().getCode()); // 관계 삭제
            projectInfoRepository.delete(projectInfo);
            projectRepository.delete(projectInfo.getProject());
            log.debug("project, projectInfo 삭제 완료");
        }
        // 2. project에 다른 projectInfo도 있는 경우 (projectInfo만 삭제)
        else {
            log.info("project에 다른 projectInfo도 있는 경우 - projectInfo 수: {}", projectInfoList.size());

            // 2-1. 해당 projectInfo에 contributor가 없으면 그냥 삭제
            if(contributors.isEmpty()) {
                projectContributorRepository.deleteByProjectInfoCode(projectInfo.getCode());
                projectInfoRepository.delete(projectInfo);
                log.debug("해당 projectInfo에 소속된 contributor가 없는 삭제 완료");
            }

            // 2-2. contributor가 있는 경우
            else {
                // 2-2-1. 해당 projectInfo가 마지막으로 등록됐을 때 그냥 삭제
                if(projectInfoList.get(projectInfoList.size()-1).equals(projectInfo)) {
                    projectContributorRepository.deleteByProjectInfoCode(projectInfo.getCode());
                    projectInfoRepository.delete(projectInfo);
                    log.debug("해당 projectInfo가 마지막으로 등록되어 소속된 contributor가 있어도 바로 삭제 완료");
                }

                // 2-2-2. 마지막에 등록된게 아니면 다음 projectInfo에 contributor 위임 후 삭제
                else {
                    log.info("contributor 위임 시작");

                    int currentIndex = projectInfoList.indexOf(projectInfo);
                    ProjectInfo nextProjectInfo = projectInfoList.get(currentIndex + 1);

                    // 현재 contributor들을 순회하면서 새로운 ProjectContributor 생성
                    for(ProjectContributor oldContributor : contributors) {
                        // 기존 contributor 삭제
                        projectContributorRepository.delete(oldContributor);

                        // 새로운 ID 생성
                        ProjectContributorId newId = new ProjectContributorId(
                                oldContributor.getId().getProjectCode(),
                                nextProjectInfo.getCode(),
                                oldContributor.getId().getGithubId()
                        );

                        // 새로운 ProjectContributor 생성
                        ProjectContributor newContributor = ProjectContributor.builder()
                                .id(newId)
                                .project(oldContributor.getProject())
                                .projectInfo(nextProjectInfo)
                                .contributor(oldContributor.getContributor())
                                .build();

                        // 새로운 contributor 저장
                        projectContributorRepository.save(newContributor);
                    }

                    log.debug("contributor 위임 완료 - 이전 projectInfo: {}, 다음 projectInfo: {}",
                            projectInfo.getCode(), nextProjectInfo.getCode());

                    // projectInfo 삭제
                    projectInfoRepository.delete(projectInfo);
                    log.debug("위임 후 projectInfo 삭제 완료");
                }
            }
        }
        // 해당 projectInfoCode의 newSurveyRequest 모두 삭제
        List<String> contributorUserCodes = projectRedisService.removeAllNewSurveyRequestByProjectInfoCode(projectInfo.getCode());

        // newSurveyRequest를 지운 후 알림 상태를 각 user에게 다시 SSE 전송
        for (String contributorUserCode : contributorUserCodes) {
            List<Integer> projectInfoCodes = projectRedisService.findAllNewSurveyResponse(contributorUserCode);
            projectSseEmitterService.sendNewSurveyRequest(contributorUserCode, projectInfoCodes);
        }

        // MongoDB 객관식 정보 삭제 (객관식까지 참여한 경우에는 참여자로 인식하지 않음)
        surveyMultipleRepository.deleteByProjectInfoCode(projectInfo.getCode());
    }

    // 로그인 유저의 메인페이지에 보여줄 프로젝트 리스트 조회 (isDone, new응답, 최신순)
    @Transactional(readOnly = true)
    public List<GetMainProjectListResponseDTO> findMainProjectList(String userCode) {
        log.info("메인페이지 프로젝트 목록 조회 시작 - userCode: {}", userCode);

        User user = findUserByCode(userCode);

        // 1. 로그인 유저의 ProjectInfo 리스트 조회
        List<ProjectInfo> projectInfoList = projectInfoRepository.findByUserCodeWithProject(userCode);
        log.debug("사용자의 ProjectInfo 조회 완료 - 조회된 ProjectInfo 수: {}", projectInfoList.size());

        // 2. Redis에서 newSurveyResponse 정보를 한 번에 조회
        Map<Integer, Integer> newSurveyResponseMap = projectRedisService.findNewSurveyResponsesByUserCode(userCode);

        // 3. ProjectInfo 리스트를 기반으로 Project 정보와 Contributor 정보를 조회 후 DTO 매핑
        List<GetMainProjectListResponseDTO> result = projectInfoList.stream()
                .map(projectInfo -> {
                    Project project = projectInfo.getProject();

                    // contributor 정보 조회 (같은 project의 해당 projectInfo 이전의 모든 contributor 조회)
                    List<String> contributorsGithubId = projectContributorRepository
                            .findByProjectCodeAndProjectInfoCodeLessThanEqual(
                                    project.getCode(),
                                    projectInfo.getCode()
                            )
                            .stream()
                            .filter(githubId -> !githubId.equals(user.getGithubId())) // 현재 사용자 제외
                            .collect(Collectors.toList());

                    // 조회한 contributor들의 githubId, 프로필 이미지 조회
                    List<ContributorDetailDTO> contributors = contributorRepository
                            .findByGithubIdIn(contributorsGithubId)
                            .stream()
                            .map(contributor -> ContributorDetailDTO.builder()
                                    .githubId(contributor.getGithubId())
                                    .profileImage(contributor.getProfileImage())
                                    .build())
                            .collect(Collectors.toList());

                    int nowParticipant = projectInfo.getParticipant() + newSurveyResponseMap.getOrDefault(projectInfo.getCode(), 0);

                    return GetMainProjectListResponseDTO.builder()
                            .organization(project.getOrganization())
                            .code(projectInfo.getCode())
                            .title(project.getTitle())
                            .participant(nowParticipant)
                            .isDone(projectInfo.getCompletedAt() != null)
                            .newSurveyResponse(newSurveyResponseMap.containsKey(projectInfo.getCode()))
                            .createdAt(projectInfo.getCreatedAt())
                            .contributors(contributors)
                            .participationRate(calculateParticipationRate(projectInfo, nowParticipant))
                            .build();
                })
                .sorted(Comparator
                        .comparing(GetMainProjectListResponseDTO::isDone) // isDone이 false인 것이 앞으로
                        .thenComparing(GetMainProjectListResponseDTO::isNewSurveyResponse, Comparator.reverseOrder()) // newSurveyResponse가 true인 것이 앞으로
                        .thenComparing(GetMainProjectListResponseDTO::getCode, Comparator.reverseOrder())) // 최신순 (code가 큰 것이 앞으로)
                .collect(Collectors.toList());

        log.info("메인페이지 프로젝트 목록 조회 완료 - 조회된 organization 수: {}", result.size());
        return result;
    }

    // 해당 유저의 모든 프로젝트 알림 삭제
    public void removeAllNotification(String userCode) {
        log.debug("해당 유저의 모든 프로젝트 알림 삭제 시작");

        // Redis에서 key가 newSurveyResponse::userCode인 데이터 삭제하며 가져오기
        Map<Integer, Integer> notificationList = projectRedisService.removeAllNotificationByUserCode(userCode);
        log.debug("해당 유저의 모든 프로젝트 알림 삭제 완료 - 삭제된 알림 수 {}", notificationList.size());

        if (notificationList.isEmpty()) {
            return;
        }

        // 각 projectInfoCode의 DB의 참여자 수 업데이트
        List<ProjectInfo> projectInfoList = projectInfoRepository.findByUserCode(userCode);

        // projectInfoList에서 redis에 있던 projectInfoCode의 참여자 수 업데이트
        projectInfoList.stream()
                .filter(info -> notificationList.containsKey(info.getCode()))
                .forEach(info -> {
                    Integer increment = notificationList.get(info.getCode());
                    if (increment != null && increment > 0) {
                        info.increaseParticipant(increment);
                        projectInfoRepository.save(info);
                        log.debug("projectInfo{}의 참여자 수 +{}",
                                info.getCode(), increment);
                    }
                });
        log.debug("Redis에 알림이 있던 전체 projectInfo {}개에 대해 participant 수 업데이트 완료", notificationList.size());
    }

    // 육각형 데이터 조회
    public GetHexagonResponseDTO getHexagonGraph(int projectInfoCode) {
        // 개인 역량별 평균 계산
        Map<String, Double> personalData = getProjectInfoAverage(projectInfoCode);

        // 전체 사용자의 역량별 평균 계산
        Map<String, Double> totalData = getTotalUserAverage();

        // 각 항목에 대해 개인 평균, 전체 평균 비교하여 isPositive만 세팅
        Map<String, Boolean> isAboveAverageBySkill = getSkillAboveAverageMap(personalData, totalData);

        // Description 데이터 Map 변환
        Map<String, Description> descriptionMap = descriptionRepository.findAll().stream()
                .collect(Collectors.toMap(Description::getCode, desc -> desc));

        // Feedback 데이터 Map 변환
        Map<String, List<Feedback>> feedbackMap = feedbackRepository.findAll().stream()
                .collect(Collectors.groupingBy(Feedback::getCode));

        // List<SkillData>를 Map으로 변환하여 필드명에 맞게 매핑
        Map<String, SkillData> skillDataMap = personalData.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> {
                            // 각 code와 isPositive에 맞는 설명, 피드백을 매핑
                            String code = entry.getKey();
                            Description description = descriptionMap.get(code);
                            boolean isPositive = isAboveAverageBySkill.get(code);

                            String feedback = feedbackMap.get(code).stream()
                                    .filter(f -> f.isPositive() == isPositive)
                                    .findFirst()
                                    .map(Feedback::getFeedback)
                                    .orElse("");

                            return SkillData.builder()
                                    .score(entry.getValue())
                                    .name(description.getName())
                                    .description(description.getDescription())
                                    .feedback(feedback)
                                    .isPositive(isPositive)
                                    .build();
                        }
                ));


        return GetHexagonResponseDTO.builder()
                .minScore(1)
                .maxScore(5)
                .sympathy(skillDataMap.get("sympathy"))
                .listening(skillDataMap.get("listening"))
                .expression(skillDataMap.get("expression"))
                .problemSolving(skillDataMap.get("problem_solving"))
                .conflictResolution(skillDataMap.get("conflict_resolution"))
                .leadership(skillDataMap.get("leadership"))
                .build();
    }

    // projectInfoCode를 받아 해당 projectInfo의 역량별 점수 매핑
    private Map<String, Double> getProjectInfoAverage(int projectInfoCode) {
        ProjectInfo projectInfo = projectInfoRepository.findById(projectInfoCode)
                .orElseThrow(ProjectInfoNotFoundException::new);

        if (projectInfo.getCompletedAt() == null) {
            throw new RuntimeException("설문이 마감되지 않아 프로젝트 결과를 조회할 수 없습니다.");
        }

        // code와 점수 매핑
        Map<String, Integer> totalScores = Map.of(
                "sympathy", projectInfo.getSympathy(),
                "listening", projectInfo.getListening(),
                "expression", projectInfo.getExpression(),
                "problem_solving", projectInfo.getProblemSolving(),
                "conflict_resolution", projectInfo.getConflictResolution(),
                "leadership", projectInfo.getLeadership()
        );

        // 총점 데이터와 참여자 수로 5점 만점의 평균 계산
        return calculateAverageScores(totalScores, projectInfo.getParticipant());
    }

    // 각 항목에 대해 평균 계산하는 메소드
    private Map<String, Double> calculateAverageScores(Map<String, Integer> totalScores, int participant) {
        Map<String, Double> averageScores = new HashMap<>();
        totalScores.forEach((key, totalScore) -> {
            double average = participant > 0 ? (double) totalScore / participant / 4 : 0;
            average = Math.round(average * 10.0) / 10.0;
            averageScores.put(key, average);
        });
        return averageScores;
    }

    // 개인의 각 역량이 전체 평균보다 높은지 낮은지 조회
    private Map<String, Boolean> getSkillAboveAverageMap(Map<String, Double> personalData, Map<String, Double> totalData){
        Map<String, Boolean> isAboveAverageMap = new HashMap<>();
        personalData.forEach((key, personalScore) -> {
            if (personalScore >= totalData.get(key)) {
                isAboveAverageMap.put(key, true);
            }
            else{
                isAboveAverageMap.put(key, false);
            }
        });
        return isAboveAverageMap;
    }

    // 임시로 사용할 전체 사용자의 역량별 평균 계산
    public Map<String, Double> getTotalUserAverage() {
        TotalScore totalScore = totalScoreRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("전체 사용자의 점수 데이터가 존재하지 않습니다."));

        int participant = totalScore.getTotalParticipant();

        Map<String, Integer> totalScores = Map.of(
                "sympathy", totalScore.getSympathy().intValue(),
                "listening", totalScore.getListening().intValue(),
                "expression", totalScore.getExpression().intValue(),
                "problem_solving", totalScore.getProblemSolving().intValue(),
                "conflict_resolution", totalScore.getConflictResolution().intValue(),
                "leadership", totalScore.getLeadership().intValue()
        );

        return calculateAverageScores(totalScores, participant);
    }

    // 각 projectInfo 5점 평균 계산 후 코드에 이름, 점수 매핑해서 반환 (포트폴리오에서 사용)
    public Map<String, ScoreData> getProjectInfoAverageWithName(int projectInfoCode) {
        Map<String, Double> scores = getProjectInfoAverage(projectInfoCode);
        return mapToNameAndValue(scores);
    }

    // code에 name과 5점 평균 매핑 (포트폴리오에서 사용)
    private Map<String, ScoreData> mapToNameAndValue(Map<String, Double> scores) {
        Map<String, Description> descriptionMap = descriptionRepository.findAll().stream()
                .collect(Collectors.toMap(Description::getCode, desc -> desc));

        Map<String, ScoreData> result = new HashMap<>();
        scores.forEach((key, value) -> {
            result.put(key, new ScoreData(descriptionMap.get(key).getName(), value));
        });

        return result;
    }
}
