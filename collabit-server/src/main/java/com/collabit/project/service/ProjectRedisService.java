package com.collabit.project.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Slf4j
@RequiredArgsConstructor
@Service
public class ProjectRedisService {

    private static final String NEW_SURVEY_RESPONSE_KEY_PREFIX = "newSurveyResponse::";
    private final RedisTemplate<String, Object> redisTemplate;

    // 특정 userCode에 대한 모든 newSurveyResponse 키-값 쌍을 조회
    public Map<Integer, Integer> findNewSurveyResponsesByUserCode(String userCode) {
        log.debug("해당 유저의 모든 프로젝트 조회 시작");
        try {
            // newSurveyResponse::{userCode}::* 패턴으로 Redis에서 해당 유저와 관련된 모든 키 조회
            String pattern = NEW_SURVEY_RESPONSE_KEY_PREFIX + userCode + "::*";
            Set<String> keys = redisTemplate.keys(pattern);

            if (keys == null || keys.isEmpty()) {
                return new HashMap<>();
            }

            // projectInfoCode를 key로, 참여자 수를 value로 하는 Map 생성
            Map<Integer, Integer> projectInfoCodeMap = new HashMap<>();
            ValueOperations<String, Object> ops = redisTemplate.opsForValue();

            for (String key : keys) {
                String[] keyParts = key.split("::");
                if (keyParts.length == 3) {
                    try {
                        // projectInfoCode 추출 후 Map(key 기준 중복x)에 저장
                        int projectInfoCode = Integer.parseInt(keyParts[2]);
                        String value = (String) ops.get(key); // Redis에서 해당 키의 value(참여자 수) 조회
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

    // userCode에 해당하는 모든 newSurveyResponse 삭제 후 반환
    public Map<Integer, Integer> removeAllNotificationByUserCode(String userCode) {
        log.debug("해당 유저의 모든 프로젝트 알림 삭제 시작");

        try {
            // 해당 유저의 모든 알림 키 조회
            String pattern = NEW_SURVEY_RESPONSE_KEY_PREFIX + userCode + "::*";
            Set<String> keys = redisTemplate.keys(pattern);

            if (keys == null || keys.isEmpty()) {
                return new HashMap<>();
            }

            // projectInfoCode를 key로, 참여자 수를 value로 하는 Map 생성
            Map<Integer, Integer> projectInfoCodeMap = new HashMap<>();
            ValueOperations<String, Object> ops = redisTemplate.opsForValue();

            for (String key : keys) {
                String[] keyParts = key.split("::");
                if (keyParts.length == 3) {
                    try {
                        int projectInfoCode = Integer.parseInt(keyParts[2]);
                        String value = (String) ops.get(key);
                        if (value != null) {
                            projectInfoCodeMap.put(projectInfoCode, Integer.parseInt(value));
                        }
                    } catch (NumberFormatException e) {
                        log.warn("Invalid projectInfoCode in Redis key: {}", key);
                        throw new RuntimeException("프로젝트 정보 코드가 올바르지 않습니다: ");
                    }
                }
            }

            // 키들 일괄 삭제
            redisTemplate.delete(keys);

            log.debug("삭제된 알림 수: {}", projectInfoCodeMap.size());
            return projectInfoCodeMap;

        } catch (Exception e) {
            log.error("Redis에서 알림 삭제 중 오류 발생", e);
            return new HashMap<>();
        }
    }
}
