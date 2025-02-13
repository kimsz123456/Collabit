package com.collabit.project.redis;

import com.collabit.project.service.ProjectRedisService;
import com.collabit.project.service.ProjectSseEmitterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectRedisSubscriber implements MessageListener { //Redis의 특정 채널에서 발생하는 이벤트 구독

    private final ProjectSseEmitterService projectSseEmitterService;
    private final ProjectRedisService projectRedisService;

    // Redis에서 이벤트가 발생할 때마다 자동으로 호출 (현재 키 이벤트 발생 시 호출되도록 설정)
    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            String channel = new String(message.getChannel(), StandardCharsets.UTF_8);

            // key 구조 = newSurveyResponse::f76f4f15-bab2-413b-881e-ae34799f9b84::9
            String[] keyParts = channel.split("::");
            String key = keyParts[0];
            String userCode = keyParts[1];

            if (key != null) {
                // 새로운 설문 응답이 들어올 때 처리
                if (key.startsWith("newSurveyResponse")) {
                    int projectInfoCode = Integer.parseInt(keyParts[2]);
                    log.debug("설문조사 응답 알림 - targetUser: {}, projectInfoCode: {}", userCode, projectInfoCode);
                    projectSseEmitterService.sendNewSurveyResponse(userCode, projectInfoCode);
                }

                // 새로운 설문 요청이 등록될 때 처리
                else if (key.startsWith("newSurveyRequest")) {
                    List<Integer> projectInfoCodes = projectRedisService.findAllProjectInfoCodesByUserCode(userCode);
                    log.debug("설문 요청 알림 - targetUser: {}, projectInfoCodes: {}", userCode, projectInfoCodes);
                    projectSseEmitterService.sendNewSurveyRequest(userCode, projectInfoCodes);
                }
            }
        } catch (Exception e) {
            log.error("Redis 설문 응답 데이터 처리 중 오류가 발생했습니다: {}", e.getMessage(), e);
        }
    }
}
