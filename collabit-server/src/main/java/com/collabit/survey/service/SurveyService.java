package com.collabit.survey.service;

import com.collabit.global.common.ErrorCode;
import com.collabit.global.error.exception.BusinessException;
import com.collabit.project.domain.entity.ProjectContributor;
import com.collabit.project.domain.entity.ProjectInfo;
import com.collabit.project.repository.ProjectContributorRepository;
import com.collabit.project.repository.ProjectInfoRepository;
import com.collabit.survey.domain.dto.*;
import com.collabit.survey.domain.entity.SurveyEssay;
import com.collabit.survey.domain.entity.SurveyQuestion;
import com.collabit.survey.domain.entity.SurveyMultiple;
import com.collabit.survey.exception.SurveyMessageDecodingException;
import com.collabit.survey.repository.SurveyMultipleRepository;
import com.collabit.survey.repository.SurveyQuestionRepository;
import com.collabit.user.domain.entity.User;
import com.collabit.user.exception.UserNotFoundException;
import com.collabit.user.repository.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;


@Slf4j
@Service
@RequiredArgsConstructor
public class SurveyService {
    private final SurveyQuestionRepository surveyQuestionRepository;
    private final SurveyMultipleRepository surveyMultipleRepository;
    private final ProjectInfoRepository projectInfoRepository;
    private final ProjectContributorRepository projectContributorRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final MongoTemplate mongoTemplate;

    // 유저의 설문 리스트 가져오기
    public List<SurveyListResponseDTO> getSurveyList(String userCode) {
        User user = userRepository.findByCode(userCode).orElseThrow(() -> {
            log.debug("User not found");
            return new UserNotFoundException();
        });
        log.debug("User GithubID: " + user.getGithubId());

        //나에게 들어온 모든 설문 요청 가져오기
        List<ProjectContributor> surveyRequest = projectContributorRepository.findByIdGithubId(user.getGithubId());
        Set<Integer> projectCode = new HashSet<>();
        for (ProjectContributor projectContributor : surveyRequest) {
            projectCode.add(projectContributor.getProject().getCode());
        }
        List<ProjectInfo> projectList = new ArrayList<>();
        for (int code : projectCode) {
            projectList.addAll(projectInfoRepository.findAllByProjectCode(code));
        }

        // 해당 설문들의 정보 가져오기
        List<SurveyListResponseDTO> surveyList = new ArrayList<>();

        for (ProjectInfo projectInfo : projectList) {
            if (projectInfo != null && !projectInfo.getUser().getCode().equals(userCode)) {
                int status = 0;
                LocalDateTime updatedAt = projectInfo.getCreatedAt();

                //주관식
                SurveyEssay surveyEssays = getEssay(userCode, projectInfo.getCode());
                //객관식
                SurveyMultiple surveyMultiples = getMultiple(userCode, projectInfo.getCode());

                //둘 다 참여한 경우
                if (surveyEssays != null) {
                    status = 2;
                    updatedAt = surveyEssays.getSubmittedAt();
                }
                // 객관식만 참여한 경우
                else if (surveyMultiples != null) {
                    status = 1;
                    updatedAt = surveyMultiples.getSubmittedAt();
                }
                log.debug("status: " + status + ", updatedAt: " + updatedAt);

                SurveyListResponseDTO dto = SurveyListResponseDTO.builder()
                        .surveyCode(projectInfo.getCode())
                        .title(projectInfo.getProject().getTitle())
                        .profileImage(projectInfo.getUser().getProfileImage())
                        .nickname(projectInfo.getUser().getNickname())
                        .status(status)
                        .updatedAt(updatedAt)
                        .build();
                surveyList.add(dto);

                log.debug(dto.toString());
            }
        }

        surveyList.sort(Comparator
                .comparing(SurveyListResponseDTO::getStatus)
                .thenComparing(SurveyListResponseDTO::getUpdatedAt, Comparator.reverseOrder()));
        return surveyList;
    }

    // 객관식 24개 모든 질문 가져오기
    public List<SurveyQuestionResponseDTO> getAllQuestions() {
        List<SurveyQuestion> questions = surveyQuestionRepository.findAll();

        if (questions.size() != 24) {
            throw new IllegalStateException("설문 문항이 24개가 아닙니다.");
        }

        List<SurveyQuestionResponseDTO> result = new ArrayList<>();
        for(int i=0; i<24; i++) {
            SurveyQuestion surveyQuestion = questions.get(i);
            result.add(new SurveyQuestionResponseDTO(surveyQuestion.getQuestionNumber(), surveyQuestion.getQuestionText()));
        }
        return result;
    }

    // 객관식 설문 결과 저장하기
    public void saveResponse(String userCode, int projectInfoCode, List<Integer> scores) {
        SurveyMultiple surveyMultiple = SurveyMultiple.builder()
                .projectInfoCode(projectInfoCode)
                .userCode(userCode)
                .scores(scores)
                .submittedAt(LocalDateTime.now())
                .build();
        log.debug("surveyResponse: {}", surveyMultiple);

        surveyMultipleRepository.save(surveyMultiple);
    }

    // 객관식 설문 답변 조회하기
    public SurveyMultipleResponseDTO getMultipleResponse(String userCode, int projectInfoCode) {
        SurveyMultiple multiple = getMultiple(userCode, projectInfoCode);
        if (multiple == null) {
            return null;
        }
        return SurveyMultipleResponseDTO.builder().scores(multiple.getScores()).submittedAt(multiple.getSubmittedAt()).build();
    }

    //주관식 설문 답변 조회하기
    public SurveyEssayResponseDTO getEssayResponse(String userCode, int projectInfoCode) {
        SurveyEssay essay = getEssay(userCode, projectInfoCode);
        System.out.println(essay);

        if (essay == null) {
            return null;
        }

        //메시지 string -> MessageDTO로 변환
        List<SurveyEssayMessageDTO> messageList;
        try {
            String jsonArray = "[" + essay.getMessages() + "]";
            messageList = objectMapper.readValue(jsonArray, new TypeReference<List<SurveyEssayMessageDTO>>() {});

        }catch (Exception e){
                throw new SurveyMessageDecodingException();

        }
        return SurveyEssayResponseDTO.builder()
                .messages(messageList.subList(2, messageList.size()))
                .submittedAt(essay.getSubmittedAt())
                .build();
    }

    public SurveyMultiple getMultiple(String userCode, int projectInfoCode) {
        return surveyMultipleRepository.findByProjectInfoCodeAndUserCode(projectInfoCode, userCode);
    }

    public SurveyEssay getEssay(String userCode, int projectInfoCode) {
        Query query = new Query();
        query.addCriteria(Criteria.where("projectInfoCode").is(projectInfoCode)
                .and("userCode").is(userCode));

        return mongoTemplate.findOne(query, SurveyEssay.class);

    }

    public SurveyDetailResponseDTO getSurveyDetail(String userCode, int projectInfoCode) {
        log.debug("설문조사 상세조회 시작");

        ProjectInfo projectInfo = projectInfoRepository.findByCode(projectInfoCode);

        if(projectInfo == null) {
            log.error("해당 ProjectInfo를 찾을 수 없습니다.");
            throw new BusinessException(ErrorCode.PROJECT_INFO_NOT_FOUND);
        }

        log.debug("조회한 projectInfo: {}", projectInfo.toString());

        return SurveyDetailResponseDTO.builder()
                .nickname(projectInfo.getUser().getNickname())
                .profileImage(projectInfo.getUser().getProfileImage())
                .title(projectInfo.getProject().getTitle())
                .surveyMultipleResponse(getMultipleResponse(userCode, projectInfoCode))
                .surveyEssayResponse(getEssayResponse(userCode, projectInfoCode))
                .build();
    }

    public void verifySurvey(String userCode, int projectInfoCode) {
        log.debug("설문조사 상세조회 시작");

        User user = userRepository.findByCode(userCode).orElseThrow(() -> {
            log.debug("User not found");
            return new UserNotFoundException();
        });
        log.debug("User GithubID: " + user.getGithubId());

        ProjectInfo projectInfo = projectInfoRepository.findByCode(projectInfoCode);

        if(projectInfo == null) {
            log.error("해당 ProjectInfo를 찾을 수 없습니다.");
            throw new BusinessException(ErrorCode.PROJECT_INFO_NOT_FOUND);
        }

        // projectInfoCode와 projectCode로
        List<String> contributorsGithubId = projectContributorRepository
            .findByProjectCodeAndProjectInfoCodeLessThanEqual(
                projectInfo.getProject().getCode(),
                projectInfo.getCode()
            )
            .stream()
            .filter(githubId -> !githubId.equals(projectInfo.getUser().getGithubId()))
            .collect(Collectors.toList());

        if(!contributorsGithubId.contains(user.getGithubId())){
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
    }
}
