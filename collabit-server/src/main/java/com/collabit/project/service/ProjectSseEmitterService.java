package com.collabit.project.service;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Configuration
@RequiredArgsConstructor
public class ProjectSseEmitterService {

    private final ConcurrentHashMap<String, SseEmitter> sseEmitters;

    // targetUser에게 새로운 설문 응답이 왔음을 SSE로 전송
    public void sendNewSurveyResponse(String userCode, int projectInfoCode) {
        SseEmitter emitter = sseEmitters.get(userCode);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                        .name("newSurveyResponse")
                        .data(projectInfoCode));
            } catch (IOException e) {
                emitter.complete();
                sseEmitters.remove(userCode);
            }
        }
    }

    // 해당 유저에게 설문 요청이 있는 projectInfoCode SSE로 전송
    public void sendNewSurveyRequest(String userCode, List<Integer> projectInfoCodes) {
        SseEmitter emitter = sseEmitters.get(userCode);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                        .name("newSurveyRequest")
                        .data(projectInfoCodes));
            } catch (IOException e) {
                emitter.complete();
                sseEmitters.remove(userCode);
            }
        }
    }

}
