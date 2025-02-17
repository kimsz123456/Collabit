package com.collabit.project.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@Service
public class ProjectRedisService {

    private static final String NEW_SURVEY_RESPONSE_KEY_PREFIX = "newSurveyResponse::";
    private static final String NEW_SURVEY_REQUEST_KEY_PREFIX = "newSurveyRequest::";
    private final RedisTemplate<String, String> stringRedisTemplate;

    // 해당 유저에게 보내진 모든 신규 설문 응답 알림 조회
    public Map<Integer, Integer> findNewSurveyResponsesByUserCode(String userCode) {
        log.debug("해당 유저의 모든 신규 설문 응답 조회 시작");
        try {
            // newSurveyResponse::{userCode}::* 패턴으로 Redis에서 해당 유저와 관련된 모든 키 조회
            String pattern = NEW_SURVEY_RESPONSE_KEY_PREFIX + userCode + "::*";
            Set<String> keys = stringRedisTemplate.keys(pattern);

            if (keys.isEmpty()) {
                return new HashMap<>();
            }

            // projectInfoCode를 key로, 참여자 수를 value로 하는 Map 생성
            Map<Integer, Integer> projectInfoCodeMap = new HashMap<>();
            ValueOperations<String, String> ops = stringRedisTemplate.opsForValue();

            for (String key : keys) {
                String[] keyParts = key.split("::");
                if (keyParts.length >= 3) {
                    try {
                        // projectInfoCode 추출 후 Map(key 기준 중복x)에 저장
                        int projectInfoCode = Integer.parseInt(keyParts[2]);
                        String value = ops.get(key); // Redis에서 해당 키의 value(참여자 수) 조회
                        if (value != null) {
                            projectInfoCodeMap.put(projectInfoCode, Integer.parseInt(value));
                        }
                    } catch (NumberFormatException e) {
                        log.warn("Invalid projectInfoCode in Redis key: {}", key);
                        throw new RuntimeException("프로젝트 정보 코드가 올바르지 않습니다: ");
                    }
                }
            }
            return projectInfoCodeMap;
        } catch (Exception e) {
            log.error("Redis에서 newSurveyResponse 조회 중 오류 발생", e);
            return new HashMap<>();
        }
    }

    // 해당 유저에게 온 신규 설문 응답 알림들 삭제
    public Map<Integer, Integer> removeAllNotificationByUserCode(String userCode) {
        log.debug("해당 유저의 모든 프로젝트 알림 삭제 시작");

        try {
            // 해당 유저의 모든 알림 키 조회
            String pattern = NEW_SURVEY_RESPONSE_KEY_PREFIX + userCode + "::*";
            Set<String> keys = stringRedisTemplate.keys(pattern);

            if (keys.isEmpty()) {
                return new HashMap<>();
            }

            // projectInfoCode를 key로, 참여자 수를 value로 하는 Map 생성
            Map<Integer, Integer> projectInfoCodeMap = new HashMap<>();
            ValueOperations<String, String> ops = stringRedisTemplate.opsForValue();

            for (String key : keys) {
                String[] keyParts = key.split("::");
                if (keyParts.length >= 3) {
                    try {
                        int projectInfoCode = Integer.parseInt(keyParts[2]);
                        String value = ops.get(key);
                        if (value != null) {
                            projectInfoCodeMap.put(projectInfoCode, Integer.parseInt(value));
                        }
                    } catch (NumberFormatException e) {
                        log.warn("projectInfoCode가 올바르지 않음: {}", key);
                        throw new RuntimeException("프로젝트 정보 코드가 올바르지 않습니다: ");
                    }
                }
            }

            // 키들 일괄 삭제
            stringRedisTemplate.delete(keys);

            log.debug("삭제된 알림 수: {}", projectInfoCodeMap.size());
            return projectInfoCodeMap;

        } catch (Exception e) {
            log.error("Redis에서 알림 삭제 중 오류 발생", e);
            return new HashMap<>();
        }
    }

    // 설문 응답을 완료하여 해당 유저의 요청 알림 삭제
    public void removeNewSurveyRequest(String userCode, String projectInfoCode) {
        log.debug("해당 유저가 응답을 완료한 프로젝트의 설문 요청 알림 삭제 시작");

        try {
            String pattern = NEW_SURVEY_REQUEST_KEY_PREFIX + userCode + "::" + projectInfoCode;
            Set<String> keys = stringRedisTemplate.keys(pattern);

            if (keys.isEmpty()) {
                log.debug("삭제할 알림이 없음: responseUserCode={}, projectInfoCode={}", userCode, projectInfoCode);
                return;
            }

            stringRedisTemplate.delete(keys);
            log.debug("알림 삭제 완료: 삭제된 알림 수={}", keys.size());
        } catch (Exception e) {
            log.error("Redis에서 설문 요청 알림 삭제 중 오류 발생: userCode={}, projectInfoCode={}",
                    userCode, projectInfoCode, e);
        }
    }

    // 어떤 유저에게 설문 요청을 보낼지 저장
    public void saveNewSurveyRequest(String userCode, Integer projectInfoCode) {
        try {
            String key = NEW_SURVEY_REQUEST_KEY_PREFIX + userCode + "::" + projectInfoCode;
            stringRedisTemplate.opsForValue().set(key, "1"); // 값은 의미 없음, 키 존재 여부만 중요
            log.debug("Redis에 설문 요청 키 저장 완료 - key: {}", key);
        } catch (Exception e) {
            log.error("Redis 설문 요청 키 저장 중 오류 발생", e);
            throw new RuntimeException("Redis 설문 요청 키 저장 실패");
        }
    }

    // 해당 유저에게 요청된 새로운 설문들 조회 (채팅 알림)
    public List<Integer> findAllNewSurveyRequest(String userCode) {
        return findProjectInfoCodes(NEW_SURVEY_REQUEST_KEY_PREFIX + userCode + "::*");
    }

    // 해당 유저에게 보내진 모든 신규 설문 응답 조회 (프로젝트 알림)
    public List<Integer> findAllNewSurveyResponse(String userCode) {
        return findProjectInfoCodes(NEW_SURVEY_RESPONSE_KEY_PREFIX + userCode + "::*");
    }

    private List<Integer> findProjectInfoCodes(String pattern) {
        try {
            Set<String> keys = stringRedisTemplate.keys(pattern);

            if (keys.isEmpty()) {
                return new ArrayList<>();
            }

            return keys.stream()
                    .map(key -> key.split("::"))
                    .filter(parts -> parts.length >= 3)
                    .map(parts -> {
                        try {
                            return Integer.parseInt(parts[2]);
                        } catch (NumberFormatException e) {
                            log.warn("projectInfoCode가 올바르지 않음: {}", parts[2]);
                            return null;
                        }
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Redis에서 projectInfoCode 조회 중 오류 발생: {}", pattern, e);
            return new ArrayList<>();
        }
    }
}
