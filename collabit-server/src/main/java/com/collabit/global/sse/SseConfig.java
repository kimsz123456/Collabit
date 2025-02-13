package com.collabit.global.sse;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.concurrent.ConcurrentHashMap;

@Configuration
public class SseConfig {

    // 모든 SSE 연결을 관리하는 ConcurrentHashMap Bean 등록
    @Bean
    public ConcurrentHashMap<String, SseEmitter> sseEmitters() {
        return new ConcurrentHashMap<>();
    }
}
