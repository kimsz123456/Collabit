package com.collabit.project.redis;

import com.collabit.project.service.SseEmitterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Slf4j
@RequiredArgsConstructor
@Service
public class ProjectRedisSubscriber implements MessageListener {

    private final SseEmitterService sseEmitterService;

    // Redis의 키 이벤트 발생 시 호출되는 메서드, 어떤 projectInfo에 대한 응답인지 알 수 있게 code를 SSE로 전송
    // Redis에서 정보를 삭제할 때는 SSE 이벤트를 보내지 않음
    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            String channel = new String(message.getChannel(), StandardCharsets.UTF_8);

            // key 구조 = newSurveyResponse::f76f4f15-bab2-413b-881e-ae34799f9b84::9
            String[] keyParts = channel.split("::");

            if(keyParts.length == 3) {
                String key = keyParts[0];

                if (key != null && key.startsWith("newSurveyResponse")) {
                    String userCode = keyParts[1];
                    int projectInfoCode = Integer.parseInt(keyParts[2]);

                    log.debug("설문조사 targetUser: {}", userCode);
                    log.debug("설문조사 projectInfoCode: {}", projectInfoCode);

                    // SSE를 통해 클라이언트에 데이터 전송
                    sseEmitterService.sendToClientProjectInfo(userCode, projectInfoCode);
                }
            }
        } catch (Exception e) {
            log.error("Redis 설문 응답 데이터 처리 중 오류가 발생했습니다: {}", e.getMessage(), e);
        }
    }
}
