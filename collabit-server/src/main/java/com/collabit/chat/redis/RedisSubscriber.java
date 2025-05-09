package com.collabit.chat.redis;

import com.collabit.chat.domain.dto.WebSocketMessageDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;

import java.nio.charset.StandardCharsets;


@Slf4j
@RequiredArgsConstructor
@Service
public class RedisSubscriber implements MessageListener {

    private final ObjectMapper objectMapper;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public void onMessage(@NonNull Message message, @Nullable byte[] pattern) {
        try {
            String body = new String(message.getBody(), StandardCharsets.UTF_8);
            WebSocketMessageDTO webSocketMessage = objectMapper.readValue(body, WebSocketMessageDTO.class);
            log.debug("Redis message received: {}", body);
            String destination = "/topic/chat/" + webSocketMessage.getRoomCode();
            messagingTemplate.convertAndSend(destination, message);
        } catch (Exception e) {
            log.error("Failed to process Redis message", e);
        }
    }
}
