package com.collabit.global.sse;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Configuration
@RequiredArgsConstructor
public class SseEmitterService {

    private final ConcurrentHashMap<String, SseEmitter> sseEmitters;

    // 클라이언트의 SSE 연결을 생성하고 초기화하는 메서드
    public SseEmitter subscribe(String userCode) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);

        emitter.onCompletion(() -> sseEmitters.remove(userCode));
        emitter.onTimeout(() -> sseEmitters.remove(userCode));

        sseEmitters.put(userCode, emitter);

        // 더미 이벤트 전송: 연결 상태 확인, 클라이언트 측 타임아웃 방지
        try {
            emitter.send(SseEmitter.event()
                    .name("connect")
                    .data("Connected!"));
        } catch (IOException e) {
            emitter.complete();
            sseEmitters.remove(userCode);
        }

        return emitter;
    }
}
