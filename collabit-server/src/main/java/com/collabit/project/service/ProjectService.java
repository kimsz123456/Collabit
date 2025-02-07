package com.collabit.project.service;

import com.collabit.project.domain.dto.*;
import com.collabit.project.domain.entity.*;
import com.collabit.project.repository.*;
import com.collabit.user.domain.entity.User;
import com.collabit.user.exception.UserNotFoundException;
import com.collabit.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
    private final DescriptionRepository descriptionRepository;

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
        }
        else {
            log.debug("기존 프로젝트 발견 - projectCode: {}, title: {}, organization: {}",
                    project.getCode(), project.getTitle(), project.getOrganization());
        }

        // 3. ProjectInfo 저장
        // 현재 로그인 유저가 해당 레포지토리를 저장한적 있는지 검증 (projectCode, userCode로 조회)
        validateProjectInfoNotExists(project.getCode(), userCode);

        // 등록되지 않은 레포지토리의 정보를 ProjectInfo에 저장
        ProjectInfo projectInfo = ProjectInfo.builder()
                .project(project)
                .user(user)
                .total(createProjectRequestDTO.getContributors().size()-1) // 본인 제외
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

        // 프론트에서 받아온 contributor와 저장된 contributor를 비교하여 중복되지 않은 contributor만 저장
        for(ContributorDetailDTO contributorDetailDTO : createProjectRequestDTO.getContributors()) {

            // 로그인 user는 해당 projectInfo의 contributor로 저장하지 않음
            if(contributorDetailDTO.getGithubId().equals(user.getGithubId())){
                continue;
            }

            boolean exists = existingContributors.stream()
                    .anyMatch(pc -> pc.getId().getGithubId().equals(contributorDetailDTO.getGithubId()));

            // 현재 DB에 해당 project 소속으로 없는 contributor인 경우
            if(!exists) {
                // Contributor 테이블에서 조회 (다른 프로젝트의 contributor로 등록되어 있을 수 있음)
                Contributor contributor = contributorRepository
                        .findByGithubId(contributorDetailDTO.getGithubId())
                        .orElse(null);

                // 다른 프로젝트에도 소속되어 있지 않는 경우 contributor 저장
                if(contributor == null) {
                    contributor = Contributor.builder()
                            .githubId(contributorDetailDTO.getGithubId())
                            .profileImage(contributorDetailDTO.getProfileImage())
                            .build();
                    contributor = contributorRepository.save(contributor);
                    log.debug("새 컨트리뷰터 저장 - githubId: {}", contributor.getGithubId());
                } else {
                    log.debug("기존 컨트리뷰터 발견 - githubId: {}", contributor.getGithubId());
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

        log.info("프로젝트 등록 완료 - projectCode: {}, projectInfoCode: {}, 컨트리뷰터 수: {}",
                project.getCode(), projectInfo.getCode(), createProjectRequestDTO.getContributors().size());
    }

    // 로그인 유저의 전체 프로젝트 조회
    @Transactional(readOnly = true)
    public List<GetProjectListResponseDTO> findProjectList(String userCode, String keyword, SortOrder sortOrder) {
        log.info("프로젝트 목록 조회 시작 - userCode: {}, keyword: {}, sortOrder: {}",
                userCode, keyword, sortOrder);

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
        Map<Integer, Boolean> newSurveyResponseMap = projectRedisService.findNewSurveyResponsesByUserCode(userCode);

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
                                        );

                                // 조회한 contributor들의 githubId, 프로필 이미지 조회
                                List<ContributorDetailDTO> contributors = contributorRepository
                                        .findByGithubIdIn(contributorsGithubId)
                                        .stream()
                                        .map(contributor -> ContributorDetailDTO.builder()
                                                .githubId(contributor.getGithubId())
                                                .profileImage(contributor.getProfileImage())
                                                .build())
                                        .collect(Collectors.toList());

                                return ProjectDetailDTO.builder()
                                        .code(projectInfo.getCode())
                                        .title(project.getTitle())
                                        .participant(projectInfo.getParticipant())
                                        .isDone(projectInfo.isDone())
                                        .newSurveyResponse(newSurveyResponseMap.getOrDefault(projectInfo.getCode(), false))
                                        .createdAt(projectInfo.getCreatedAt())
                                        .contributors(contributors)
                                        .participationRate(calculateParticipationRate(projectInfo))
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

        log.info("프로젝트 목록 조회 완료 - 조회된 organization 수: {}", result.size());
        return result;
    }

    // 참여율 계산 메소드
    private double calculateParticipationRate(ProjectInfo projectInfo) {
        double rate = projectInfo.getTotal() == 0 ? 0 :
                (double) projectInfo.getParticipant() / projectInfo.getTotal() * 100;
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
                        .organization(pi.getProject().getOrganization())
                        .title(pi.getProject().getTitle())
                        .build()
                ).toList();
        log.debug("사용자의 ProjectInfo 정보로 Project 정보 조회 후 매핑 완료 - 매핑된 Project 수: {}", result.size());

        return result;
    }

    // 프로젝트 설문조사 마감
    public void updateProjectSurveyState(String userCode, int code) {
        // 해당 projectInfo가 현재 로그인된 user의 소유가 맞는지 검증
        ProjectInfo projectInfo = validateProjectInfo(userCode, code);

        if (projectInfo.isDone()) {
            log.error("isDone이 이미 true인 경우 - 해당 ProjectInfo의 isDone: {}", true);
            throw new RuntimeException("해당 프로젝트의 설문조사는 이미 마감되었습니다.");
        }

        // 설문 참여자가 전체 컨트리뷰터 수의 1/2 이상일 경우에만 마감 가능
        if(projectInfo.getParticipant() < projectInfo.getTotal()/2) {
            log.error("설문 참여자가 부족한 경우 - 해당 ProjectInfo의 participant 수: {}, total 수: {}", projectInfo.getParticipant(), projectInfo.getTotal());
            throw new RuntimeException("해당 프로젝트의 설문 참여자 수가 부족합니다. 전체 인원의 반 이상이 참여해야 마감이 가능합니다.");
        }

       log.debug("해당 프로젝트 설문조사 마감 시작 - 해당 ProjectInfo의 isDone: {}", false);
       projectInfo.completeSurvey();
       projectInfoRepository.save(projectInfo);
       log.debug("해당 프로젝트 설문조사 마감 완료");

       // 포트폴리오 개발 시 isUpdate 함께 변경
    }

    // 해당 프로젝트 설문에 참여한 사람이 없을 경우 프로젝트 삭제
    public void removeProject(String userCode, int code) {
        // 삭제할 projectInfo가 현재 로그인된 user의 소유가 맞는지 검증
        ProjectInfo projectInfo = validateProjectInfo(userCode, code);

        // 설문 참여자가 있거나 마감됐을 경우 삭제 불가
        if(projectInfo.isDone() || projectInfo.getParticipant() >= 1) {
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
    }

    // 로그인 유저의 메인페이지에 보여줄 프로젝트 리스트 조회 (isDone, new응답, 최신순)
    @Transactional(readOnly = true)
    public List<GetMainProjectListResponseDTO> findMainProjectList(String userCode) {
        log.info("메인페이지 프로젝트 목록 조회 시작 - userCode: {}", userCode);

        // 1. 로그인 유저의 ProjectInfo 리스트 조회
        List<ProjectInfo> projectInfoList = projectInfoRepository.findByUserCodeWithProject(userCode);
        log.debug("사용자의 ProjectInfo 조회 완료 - 조회된 ProjectInfo 수: {}", projectInfoList.size());

        // 2. Redis에서 newSurveyResponse 정보를 한 번에 조회
        Map<Integer, Boolean> newSurveyResponseMap = projectRedisService.findNewSurveyResponsesByUserCode(userCode);

        // 3. ProjectInfo 리스트를 기반으로 Project 정보와 Contributor 정보를 조회 후 DTO 매핑
        List<GetMainProjectListResponseDTO> result = projectInfoList.stream()
                .map(projectInfo -> {
                    Project project = projectInfo.getProject();

                    // contributor 정보 조회 (같은 project의 해당 projectInfo 이전의 모든 contributor 조회)
                    List<String> contributorsGithubId = projectContributorRepository
                            .findByProjectCodeAndProjectInfoCodeLessThanEqual(
                                    project.getCode(),
                                    projectInfo.getCode()
                            );

                    // 조회한 contributor들의 githubId, 프로필 이미지 조회
                    List<ContributorDetailDTO> contributors = contributorRepository
                            .findByGithubIdIn(contributorsGithubId)
                            .stream()
                            .map(contributor -> ContributorDetailDTO.builder()
                                    .githubId(contributor.getGithubId())
                                    .profileImage(contributor.getProfileImage())
                                    .build())
                            .collect(Collectors.toList());

                    return GetMainProjectListResponseDTO.builder()
                            .organization(project.getOrganization())
                            .code(projectInfo.getCode())
                            .title(project.getTitle())
                            .participant(projectInfo.getParticipant())
                            .isDone(projectInfo.isDone())
                            .newSurveyResponse(newSurveyResponseMap.getOrDefault(projectInfo.getCode(), false))
                            .createdAt(projectInfo.getCreatedAt())
                            .contributors(contributors)
                            .participationRate(calculateParticipationRate(projectInfo))
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
        Map<Integer, Object> notificationList = projectRedisService.removeAllNotificationByUserCode(userCode);
        log.debug("해당 유저의 모든 프로젝트 알림 삭제 완료 - 삭제된 알림 수 {}", notificationList.size());

        // 각 projectInfoCode의 DB의 참여자 수 업데이트
        List<ProjectInfo> projectInfoList = projectInfoRepository.findByUserCode(userCode);

        for(Integer projectInfoCode : notificationList.keySet()) {
            // projectInfoList에서 redis에 있던 projectInfoCode를 가진 projectInfo 찾기
            projectInfoList.stream()
                    .filter(info -> info.getCode() == projectInfoCode)
                    .findFirst()
                    .ifPresent(info -> {
                        // Redis에서 가져온 값으로 participant 수 업데이트
                        Object value = notificationList.get(projectInfoCode);
                        if (value != null) {
                            info.increaseParticipant(((Number) value).intValue()); // redis에서 가져온 Object 타입을 int형으로
                            projectInfoRepository.save(info);
                        }
                    });
        }
        log.debug("Redis에 알림이 있던 전체 projectInfo {}개에 대해 participant 수 업데이트 완료", notificationList.size());
    }

    // 해당 프로젝트의 알림만 삭제
    public void removeNotification(String userCode, int code){
        log.debug("특정 프로젝트 알림 삭제 시작");

        // Redis에서 특정 프로젝트 알림 삭제하며 값 가져오기
        Object value = projectRedisService.removeNotificationByUserCodeAndProjectCode(userCode, code);

        if (value != null) {
            projectInfoRepository.findById(code) // projectInfo 조회
                    .ifPresent(info -> {
                        // Redis에서 가져온 값으로 participant 수 업데이트
                        info.increaseParticipant(((Number) value).intValue());
                        projectInfoRepository.save(info);
                        log.debug("ProjectInfo(code: {}) participant 수 업데이트 완료: {}",
                                code, value);
                    });
        }
    }

    // 로그인 유저와 전체 유저의 객관식 데이터 평균값 계산 후 100점 변환
    public List<GetBarGraphResponseDTO> getBarGraph(int projectInfoCode) {

        HashMap<String, Integer> total = calculateMultipleScore(projectInfoCode); // 전체 사용자의 객관식 평균
        HashMap<String, Integer> personal = calculateMultipleScore(projectInfoCode); // 해당 프로젝트의 객관식 평균
        List<Description> descriptions = descriptionRepository.findByIdIsPositiveTrue(); // 각 항목의 이름 조회
        log.debug("전체, 프로젝트별 객관식 점수 조회 완료, descriptions 조회 완료");

        // description의 code를 key로, name을 value로 하는 Map 생성
        Map<String, String> codeToNameMap = descriptions.stream()
                .collect(Collectors.toMap(
                        desc -> desc.getId().getCode(),
                        Description::getName
                ));

        // 모든 Hash의 key를 통일해서 value 조회
        List<GetBarGraphResponseDTO> result = personal.entrySet().stream()
                .map(entry -> GetBarGraphResponseDTO.builder()
                        .name(codeToNameMap.get(entry.getKey()))
                        .me(entry.getValue())
                        .avg(total.get(entry.getKey()))
                        .build())
                .toList();
        log.debug("각 항목에 대해 전체, 프로젝트별 객관식 평균 이름과 함께 DTO 빌더 - 반환할 result 수: {}", result.size());

        return result;
    }

    // projectInfo에 해당하는 6개 항목의 객관식 평균 계산
    public HashMap<String, Integer> calculateMultipleScore(int projectInfoCode) {
        log.debug("해당 projectInfo(code = {})의 6개 항목에 대한 객관식 평균(100점) 계산 시작", projectInfoCode);

        ProjectInfo projectInfo = projectInfoRepository.findByCode(projectInfoCode);

        if(projectInfo == null) {
            log.error("projectInfo에 해당하는 정보 없음");
            throw new RuntimeException("해당 projectInfo 정보가 없습니다.");
        }

        if (!projectInfo.isDone()) {
            log.error("해당 projectInfo는 마감되지 않아 조회 불가");
            throw new RuntimeException("설문이 마감되지 않아 프로젝트 결과를 조회할 수 없습니다.");
        }

        HashMap<String, Integer> scores = new HashMap<>();

        // 각 필드의 총점과 필드명을 매핑
        Map<String, Integer> totalScores = Map.of(
                "sympathy", projectInfo.getSympathy(),
                "listening", projectInfo.getListening(),
                "expression", projectInfo.getExpression(),
                "problem_solving", projectInfo.getProblemSolving(), // DB와 맞추기 위해 스네이크 네이밍
                "conflict_resolution", projectInfo.getConflictResolution(),
                "leadership", projectInfo.getLeadership()
        );

        // 각 항목별 평균 계산 후 100점 변환
        int participant = projectInfo.getParticipant();
        totalScores.forEach((key, totalScore) -> {
            double average = participant > 0 ? (double) totalScore / participant : 0;
            scores.put(key, convertTo100Scale(average));
        });

        return scores;
    }

    // 5점 만점을 100점으로 변환하는 메서드 (선형 변환)
    private int convertTo100Scale(double score) {
        return (int) Math.round((score / 5.0) * 100);
    }
}
