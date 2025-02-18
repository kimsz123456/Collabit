package com.collabit.chat.service;

import com.collabit.chat.domain.dto.ChatMessageRequestDTO;
import com.collabit.chat.domain.dto.WebSocketMessageDTO;
import com.collabit.chat.redis.RedisPublisher;
import com.collabit.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;
    private final RedisPublisher redisPublisher;
    private final ChatRedisService chatRedisService;
    private final ChatRoomDetailService chatRoomDetailService;
    private final ChatSseEmitterService chatSseEmitterService;

    // 채팅 메시지 처리
    public void handleChatMessage(WebSocketMessageDTO messageDTO, String userCode) {
        int roomCode = messageDTO.getRoomCode();
        log.debug("Handling chat message: room={}, user={}", roomCode, userCode);
        // Redis에 메시지 발행 (다중 서버 환경을 위해)
        String channelKey =  "chat_message:" + roomCode;
        redisPublisher.publish(channelKey, messageDTO);
        // STOMP를 통해 클라이언트에게 메시지 전송
        String destination = "/topic/chat/" + roomCode;
        messagingTemplate.convertAndSend(destination, messageDTO);

        ChatMessageRequestDTO chatMessage = ChatMessageRequestDTO.builder()
                .message(messageDTO.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
        chatRoomDetailService.saveMessage(chatMessage, userCode, roomCode);
        chatRedisService.updateRoomMessageStatus(roomCode, userCode, true);

        // 수신자의 모든 안 읽은 채팅방 코드 목록 조회 후 SSE로 전송
        String otherUserCode = chatRoomDetailService.getOtherUserByRoomCode(roomCode, userCode);
        List<Integer> unreadRooms = chatRedisService.getUnreadChatRoomForUser(otherUserCode);
        chatSseEmitterService.sendUnreadChatRooms(otherUserCode, unreadRooms); // 상대 유저에게 안읽은 방 알림 전송
    }
}
