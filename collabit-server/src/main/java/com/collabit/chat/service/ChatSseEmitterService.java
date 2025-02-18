package com.collabit.chat.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatSseEmitterService {

    private final ConcurrentHashMap<String, SseEmitter> sseEmitters;

    // 채팅 알림 전송 (존재하는 chat_room code의 리스트 SSE 전송)
    public void sendUnreadChatRooms(String userCode, List<Integer> roomCodes) {
        sendEventSafely("newChatRequest", roomCodes, userCode);
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
