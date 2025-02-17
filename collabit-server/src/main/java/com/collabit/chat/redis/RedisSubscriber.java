package com.collabit.chat.redis;

import com.collabit.chat.domain.dto.WebSocketMessageDTO;
import com.collabit.chat.service.ChatRedisService;
import com.collabit.chat.service.ChatSseEmitterService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Slf4j
@RequiredArgsConstructor
@Service
public class RedisSubscriber implements MessageListener {

    private final ObjectMapper objectMapper;
    private final SimpMessagingTemplate messagingTemplate;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ChatSseEmitterService chatSseEmitterService;
    private final ChatRedisService chatRedisService;

    @Override
    public void onMessage(@NonNull Message message, @Nullable byte[] pattern) {
        try {
            String channel = new String(pattern, StandardCharsets.UTF_8);

            // 키 이벤트 처리
            if (channel.contains("__keyevent@")) {
                handleKeyEvent(message);
                return;
            }

            // 채팅 메시지 처리
            String body = new String(message.getBody(), StandardCharsets.UTF_8);
            WebSocketMessageDTO webSocketMessage = objectMapper.readValue(body, WebSocketMessageDTO.class);
            log.debug("Redis message received: {}", body);
            String destination = "/topic/chat/" + webSocketMessage.getRoomCode();
            messagingTemplate.convertAndSend(destination, message);
        } catch (Exception e) {
            log.error("Failed to process Redis message", e);
        }
    }

    private void handleKeyEvent(Message message) {
        String key = new String(message.getBody(), StandardCharsets.UTF_8);
        if (key.startsWith("chat_message:")) {
            try {
                // Hash의 모든 필드(userCode) 가져오기
                Map<Object, Object> entries = redisTemplate.opsForHash().entries(key);

                // 각 유저에 대해 전체 안읽은 채팅방 목록 전송
                for (Map.Entry<Object, Object> entry : entries.entrySet()) {
                    String userCode = entry.getKey().toString();
                    List<Integer> unreadRooms = chatRedisService.getUnreadChatRoomForUser(userCode);
                    chatSseEmitterService.sendUnreadChatRooms(userCode, unreadRooms);
                }
            } catch (Exception e) {
                log.error("Failed to process chat message key event", e);
            }
        }
    }
}
