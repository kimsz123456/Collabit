package com.collabit.project.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectSseEmitterService {

    private final ConcurrentHashMap<String, SseEmitter> sseEmitters;
    private final ProjectRedisService projectRedisService;

    // targetUser에게 새로운 설문 응답이 왔음을 SSE로 전송
    public void sendNewSurveyResponse(String userCode, List<Integer> projectInfoCodes) {
        sendEventSafely("newSurveyResponse", projectInfoCodes, userCode);
    }

    // 해당 유저에게 설문 요청이 있는 projectInfoCode SSE로 전송
    public void sendNewSurveyRequest(String userCode, List<Integer> projectInfoCodes) {
        sendEventSafely("newSurveyRequest", projectInfoCodes, userCode);
    }

    // (헤더에서 사용) 해당 유저에게 요청된 설문 알림 리스트, 신규 응답이 있는 알림 리스트
    public void sendHeaderNotification(String userCode) {
        List<Integer> newSurveyRequestList = projectRedisService.findAllNewSurveyRequest(userCode);
        List<Integer> newSurveyResponseList = projectRedisService.findAllNewSurveyResponse(userCode);

        sendEventSafely("newSurveyRequest", newSurveyRequestList, userCode);
        sendEventSafely("newSurveyResponse", newSurveyResponseList, userCode);
    }

    // 해당 사용자의 newSurveyRequest를 모두 삭제 후 해당 상태 전송
    public void sendAfterDeleteSurveyReqeust(String userCode) {
        projectRedisService.removeNewSurveyRequestByUser(userCode); // 해당 유저의 newSurveyRequest 모두 삭제
        sendEventSafely("newSurveyRequest", new ArrayList<>(), userCode); // Redis에서 해당 키를 다 삭제했으므로 조회 의미x
    }

    private void sendEventSafely(String eventName, Object data, String userCode) {
        SseEmitter emitter = sseEmitters.get(userCode);

        if(emitter == null) {
            log.warn("해당 유저의 SSE emitter를 찾을 수 없음: {}", userCode);
            return;
        }

        try {
            Map<String, Object> eventData = new HashMap<>();
            eventData.put("type", eventName);
            eventData.put("data", data);

            emitter.send(SseEmitter.event()
                    .name("message")
                    .data(eventData));
        } catch (IOException e) {
            log.error("{} 유저에게 {} 이벤트 전송 실패", eventName, userCode, e);
            emitter.complete();
            sseEmitters.remove(userCode);
        }
    }
}
