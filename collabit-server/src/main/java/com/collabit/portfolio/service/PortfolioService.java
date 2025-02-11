package com.collabit.portfolio.service;

import com.collabit.global.common.ErrorCode;
import com.collabit.global.error.exception.BusinessException;
import com.collabit.portfolio.domain.dto.*;
import com.collabit.portfolio.domain.entity.Portfolio;
import com.collabit.portfolio.domain.entity.Description;
import com.collabit.portfolio.domain.entity.Feedback;
import com.collabit.portfolio.repository.DescriptionRepository;
import com.collabit.portfolio.repository.FeedbackRepository;
import com.collabit.portfolio.repository.PortfolioRepository;
import com.collabit.project.domain.entity.ProjectInfo;
import com.collabit.project.domain.entity.TotalScore;
import com.collabit.project.repository.ProjectInfoRepository;
import com.collabit.project.repository.TotalScoreRepository;
import com.collabit.project.service.ProjectService;
import java.time.LocalDateTime;

import com.collabit.user.exception.UserNotFoundException;
import com.collabit.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PortfolioService {
    private final ProjectInfoRepository projectInfoRepository;
    private final DescriptionRepository descriptionRepository;
    private final FeedbackRepository feedbackRepository;
    private final TotalScoreRepository totalScoreRepository;
    private final PortfolioRepository portfolioRepository;
    private final UserRepository userRepository;
    private final ProjectService projectService;

    public GetMultipleHexagonProgressResponseDTO getHexagonAndProgressbarGraph(String userCode) {

        // 개인 역량별 평균 계산
        Map<String, Double> userAverages = getUserAverage(userCode);

        // 전체 사용자의 역량별 평균 계산
        Map<String, Double> totalUserAverages = getTotalUserAverage();

        // 각 항목에 대해 개인 평균, 전체 평균 비교하여 isPositive만 세팅
        Map<String, Boolean> isAboveAverageBySkill = getSkillAboveAverageMap(userAverages, totalUserAverages);

        // Description 데이터 Map 변환
        Map<String, Description> descriptionMap = descriptionRepository.findAll().stream()
            .collect(Collectors.toMap(Description::getCode, desc -> desc));

        // Feedback 데이터 Map 변환
        Map<String, List<Feedback>> feedbackMap = feedbackRepository.findAll().stream()
            .collect(Collectors.groupingBy(Feedback::getCode));

        // List<SkillData>를 Map으로 변환하여 필드명에 맞게 매핑
        Map<String, SkillData> skillDataMap = userAverages.entrySet().stream()
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

        GetHexagonResponseDTO hexagon = GetHexagonResponseDTO.builder()
            .minScore(1)
            .maxScore(5)
            .sympathy(skillDataMap.get("sympathy"))
            .listening(skillDataMap.get("listening"))
            .expression(skillDataMap.get("expression"))
            .problemSolving(skillDataMap.get("problem_solving"))
            .conflictResolution(skillDataMap.get("conflict_resolution"))
            .leadership(skillDataMap.get("leadership"))
            .build();

        GetProgressResponseDTO progress = GetProgressResponseDTO.builder()
            .sympathy(buildScoreData("sympathy", userAverages.get("sympathy"), totalUserAverages.get("sympathy")))
            .listening(buildScoreData("listening", userAverages.get("listening"), totalUserAverages.get("listening")))
            .expression(buildScoreData("expression", userAverages.get("expression"), totalUserAverages.get("expression")))
            .problemSolving(buildScoreData("problemSolving", userAverages.get("problem_solving"), totalUserAverages.get("problem_solving")))
            .conflictResolution(buildScoreData("conflictResolution", userAverages.get("conflict_resolution"), totalUserAverages.get("conflict_resolution")))
            .leadership(buildScoreData("leadership", userAverages.get("leadership"), totalUserAverages.get("leadership")))
            .minScore(1)
            .maxScore(5)
            .build();

        return GetMultipleHexagonProgressResponseDTO.builder()
            .hexagon(hexagon)
            .progress(progress)
            .build();
    }

    private Map<String, Boolean> getSkillAboveAverageMap(Map<String, Double> userAverages, Map<String, Double> totalUserAverages){
        Map<String, Boolean> isAboveAverageMap = new HashMap<>();
        userAverages.forEach((key, personalScore) -> {
            if (personalScore >= totalUserAverages.get(key)) {
                isAboveAverageMap.put(key, true);
            }
            else{
                isAboveAverageMap.put(key, false);
            }
        });
        return isAboveAverageMap;
    }

    private ScoreData buildScoreData(String name, Double userScore, Double totalScore) {
        return ScoreData.builder()
            .name(name)
            .score(calculateProgressBarValue(userScore, totalScore))
            .build();
    }

    // 유저별 평균점수 상대위치 계산
    private int calculateProgressBarValue(double userAverage, double totalAverageScore) {
        if (userAverage >= totalAverageScore) {
            // 평균 이상인 경우 (50~100)
            double fraction = (userAverage - totalAverageScore) / (5.0 - totalAverageScore);
            return (int) Math.round(fraction * 50) + 50;
        } else {
            // 평균 이하인 경우 (0~50)
            double fraction = (userAverage - 1.0) / (totalAverageScore - 1.0);
            return (int) Math.round(fraction * 50);
        }
    }

    // 유저별 평균 계산
    private Map<String, Double>  getUserAverage(String userCode) {
        // 유저가 참여한 모든 프로젝트 조회(단 설문이 종료된 것만)
        Portfolio portfolio = portfolioRepository.findByUserCode(userCode).orElseThrow(()->{
            throw new RuntimeException("포트폴리오가 업데이트 되지 않았습니다.");
        });
        log.debug("portfolio: {}", portfolio);

        return calculateUserAverageScores(portfolio);
    }

    private Map<String, Double> calculateUserAverageScores(Portfolio portfolio) {
        int participant = portfolio.getParticipant();

        Map<String, Long> scores = Map.of(
            "sympathy", portfolio.getSympathy(),
            "listening", portfolio.getListening(),
            "expression", portfolio.getExpression(),
            "problem_solving", portfolio.getProblemSolving(),
            "conflict_resolution", portfolio.getConflictResolution(),
            "leadership", portfolio.getLeadership()
        );

        return calculateAverageScores(scores.entrySet().stream()
            .collect(Collectors.toMap(
                Map.Entry::getKey,
                e -> e.getValue().intValue()
            )), participant);
    }

    // 전체 사용자 평균 계산
    private Map<String, Double> getTotalUserAverage() {
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

    private Map<String, Double> calculateAverageScores(Map<String, Integer> totalScores, int participant) {
        Map<String, Double> averageScores = new HashMap<>();
        totalScores.forEach((key, totalScore) -> {
            double average = participant > 0 ? (double) totalScore / participant : 0;
            average = Math.round(average * 10.0) / 10.0;
            averageScores.put(key, average);
        });
        return averageScores;
    }

    // 프로젝트 기간별 비교 그래프 데이터 조회
    public GetTimelineResponseDTO getTimelineGraph(String userCode) {
        // 현재 로그인된 유저의 설문이 마감된 최근 8개 projectInfo 조회
        List<ProjectInfo> projectInfoList = projectInfoRepository.findTop8ByUserCodeAndCompletedAtIsNotNullOrderByCompletedAtDesc(userCode);

        if(projectInfoList == null || projectInfoList.isEmpty()) {
            throw new BusinessException(ErrorCode.PROJECT_INFO_NOT_FOUND);
        }

        List<TimelineData> timelineDataList = new ArrayList<>();

        // 각 projectInfo의 항목별 객관식 점수 구하기
        for (ProjectInfo projectInfo : projectInfoList) {
            Map<String, ScoreData> nameAndScores = projectService.getProjectInfoAverageWithName(projectInfo.getCode());

            TimelineData timelineData = TimelineData.builder()
                    .projectName(projectInfo.getProject().getTitle())
                    .organization(projectInfo.getProject().getOrganization())
                    .completedAt(projectInfo.getCompletedAt())
                    .sympathy(nameAndScores.get("sympathy"))
                    .listening(nameAndScores.get("listening"))
                    .expression(nameAndScores.get("expression"))
                    .problemSolving(nameAndScores.get("problem_solving"))
                    .conflictResolution(nameAndScores.get("conflict_resolution"))
                    .leadership(nameAndScores.get("leadership"))
                    .build();

            timelineDataList.add(timelineData);
        }

        return GetTimelineResponseDTO.builder()
                .timeline(timelineDataList)
                .minScore(1)
                .maxScore(5)
                .build();
    }

    // 포트폴리오 상태 (갱신 가능 여부, 포트폴리오 존재 여부, 포트폴리오 참여자 수) 조회
    public GetPortfolioStatusResponseDTO getPortfolioStatus(String userCode) {
        // 포트폴리오 존재 여부
        Portfolio portfolio = portfolioRepository.findById(userCode).orElse(null);

        // 포트폴리오 참여자 수
        List<ProjectInfo> completedProjectList = projectInfoRepository.findByUser_CodeAndCompletedAtIsNotNull(userCode);
        int totalParticipant = calTotalParticipant(completedProjectList);

        // 포트폴리오 갱신 가능 여부
        boolean isUpdate = projectService.canUpdatePortfolio(portfolio, totalParticipant);

        return GetPortfolioStatusResponseDTO.builder()
                .isUpdate(isUpdate)
                .isExist(portfolio!=null)
                .totalParticipant(totalParticipant)
                .build();
    }

    // 포트폴리오 기본 정보(포트폴리오 대상 닉네임, 참여자 수, 프로젝트 수) 조회
    public GetPortfolioInfoResponseDTO getPortfolioInfo(String userCode) {
        Portfolio portfolio = portfolioRepository.findById(userCode)
                .orElseThrow(() -> new RuntimeException("아직 포트폴리오가 생성되지 않았습니다."));

        return GetPortfolioInfoResponseDTO.builder()
                .nickname(portfolio.getUser().getNickname())
                .participant(portfolio.getParticipant())
                .project(portfolio.getProject())
                .build();
    }

    private int calTotalParticipant(List<ProjectInfo> completedProjectList){
        return completedProjectList.stream()
                .mapToInt(ProjectInfo::getParticipant)
                .sum();
    }

    @Transactional
    public void generatePortfolio(String userCode) {
        Portfolio portfolio = portfolioRepository.findByUserCode(userCode)
                .orElse(null);

        // 포트폴리오 참여자 수
        List<ProjectInfo> completedProjectList = projectInfoRepository.findByUser_CodeAndCompletedAtIsNotNull(userCode);
        int totalParticipant = calTotalParticipant(completedProjectList);

        // 포트폴리오 갱신 가능 여부
        if(!projectService.canUpdatePortfolio(portfolio, totalParticipant)){
            throw new RuntimeException("포트폴리오를 생성할 수 없는 상태입니다.");
        }

        if (portfolio == null) portfolio = new Portfolio();

        LocalDateTime lastUpdatedAt = (portfolio.getUpdatedAt() != null)
                ? portfolio.getUpdatedAt()
                : LocalDateTime.of(2025,1,1,0,0,0);

        List<ProjectInfo> newProjectInfos = projectInfoRepository.findAllByUserCodeAndCompletedAtAfter(
                userCode,
                lastUpdatedAt
        );

        if (!newProjectInfos.isEmpty()) {
            Map<String, Long> totalScores = new HashMap<>();
            int totalProjects = portfolio.getProject() + newProjectInfos.size();
            int totalParticipants = portfolio.getParticipant();

            for (ProjectInfo info : newProjectInfos) {
                totalScores.merge("sympathy", (long) info.getSympathy(), Long::sum);
                totalScores.merge("listening", (long) info.getListening(), Long::sum);
                totalScores.merge("expression", (long) info.getExpression(), Long::sum);
                totalScores.merge("problemSolving", (long) info.getProblemSolving(), Long::sum);
                totalScores.merge("conflictResolution", (long) info.getConflictResolution(), Long::sum);
                totalScores.merge("leadership", (long) info.getLeadership(), Long::sum);
                totalParticipants += info.getParticipant();
            }

            portfolio = Portfolio.builder()
                    .user(userRepository.findById(userCode)
                            .orElseThrow(UserNotFoundException::new))
                    .userCode(userCode)
                    .project(totalProjects)
                    .participant(totalParticipants)
                    .sympathy(totalScores.getOrDefault("sympathy", 0L))
                    .listening(totalScores.getOrDefault("listening", 0L))
                    .conflictResolution(totalScores.getOrDefault("conflictResolution", 0L))
                    .expression(totalScores.getOrDefault("expression", 0L))
                    .problemSolving(totalScores.getOrDefault("problemSolving", 0L))
                    .leadership(totalScores.getOrDefault("leadership", 0L))
                    .isUpdate(true)
                    .updatedAt(LocalDateTime.now())
                    .build();

            portfolioRepository.save(portfolio);
        }
    }

    public GetAverageResponseDTO getAverage() {
        Map<String, Description> descriptionMap = descriptionRepository.findAll().stream()
                .collect(Collectors.toMap(Description::getCode, desc -> desc));

        Map<String, Double> averages = getTotalUserAverage();

        return GetAverageResponseDTO.builder()
            .sympathy(new ScoreData(descriptionMap.get("sympathy").getName(), averages.get("sympathy")))
            .listening(new ScoreData(descriptionMap.get("listening").getName(), averages.get("listening")))
            .expression(new ScoreData(descriptionMap.get("expression").getName(), averages.get("expression")))
            .problemSolving(new ScoreData(descriptionMap.get("problem_solving").getName(), averages.get("problem_solving")))
            .conflictResolution(new ScoreData(descriptionMap.get("conflict_resolution").getName(), averages.get("conflict_resolution")))
            .leadership(new ScoreData(descriptionMap.get("leadership").getName(), averages.get("leadership")))
            .minScore(1)
            .maxScore(5)
            .build();
    }
}


