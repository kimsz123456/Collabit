package com.collabit.chat.service;

import com.collabit.chat.domain.dto.ChatMessageRequestDTO;
import com.collabit.chat.domain.dto.ChatRoomSwitchDTO;
import com.collabit.chat.domain.dto.ChatUserStatusDTO;
import com.collabit.chat.domain.dto.WebSocketMessageDTO;
import com.collabit.chat.redis.RedisKeyUtil;
import com.collabit.chat.redis.RedisPublisher;
import com.collabit.chat.websocket.WebSocketSessionManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;  // STOMP 메시징 처리
    private final RedisPublisher redisPublisher;  // Redis로 메시지 발행
    private final ChatRedisService chatRedisService;  // Redis 관련 채팅 서비스
    private final ChatRoomDetailService chatRoomDetailService;  // 채팅 메시지 저장 서비스
    private final WebSocketSessionManager webSocketSessionManager;  // WebSocket 세션 관리

    // 채팅 메시지 처리
    public void handleChatMessage(WebSocketMessageDTO messageDTO, String userCode) {
        int roomCode = messageDTO.getRoomCode();
        log.debug("Handling chat message: room={}, user={}", roomCode, userCode);
        // Redis에 메시지 발행 (다중 서버 환경을 위해)
        String channelKey = RedisKeyUtil.getChatMessageChannelKey(roomCode);
        redisPublisher.publish(channelKey, messageDTO);

        // STOMP를 통해 클라이언트에게 메시지 전송
        String destination = "/topic/chat/" + roomCode;
        messagingTemplate.convertAndSend(destination, messageDTO);

        // DB에 메시지 저장
        ChatMessageRequestDTO chatMessage = ChatMessageRequestDTO.builder()
                .message(messageDTO.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
        chatRoomDetailService.saveMessage(chatMessage, userCode, roomCode);

        // 읽지 않은 메시지 상태 업데이트
        chatRedisService.updateRoomMessageStatus(roomCode, userCode, false);
    }

    // 사용자가 채팅방에 입장할 때
    public void handleUserEnter(int roomCode, String userCode) {
        // 사용자 입장 상태 메시지 생성
        ChatUserStatusDTO statusMessage = createRoomStatusMessage(userCode, roomCode, true);
        
        // Redis에 사용자 추가
        chatRedisService.addUserToRoom(roomCode, userCode);
        
        // 상태 메시지 발행 (Redis + STOMP)
        publishRoomStatusMessage(statusMessage, roomCode);
        
        String destination = "/topic/chat/" + roomCode;
        messagingTemplate.convertAndSend(destination, 
            Map.of("type", "USER_ENTER", "userCode", userCode));
            
        log.debug("User {} entered room {}", userCode, roomCode);
    }

    // 사용자가 채팅방을 떠날 때
    public void handleUserExit(int roomCode, String userCode) {
        // 사용자 퇴장 상태 메시지 생성
        ChatUserStatusDTO statusMessage = createRoomStatusMessage(userCode, roomCode, false);
        
        // Redis에서 사용자 제거
        chatRedisService.removeUserFromRoom(roomCode, userCode);
        
        // 상태 메시지 발행 (Redis + STOMP)
        publishRoomStatusMessage(statusMessage, roomCode);
        
        String destination = "/topic/chat/" + roomCode;
        messagingTemplate.convertAndSend(destination, 
            Map.of("type", "USER_EXIT", "userCode", userCode));
            
        log.debug("User {} exited room {}", userCode, roomCode);
    }

    // 방 이동
    public void switchUserRoom(String userCode, ChatRoomSwitchDTO switchDTO) {
        int newRoomCode = switchDTO.getNewRoomCode();
        webSocketSessionManager.addUserToRoom(userCode, newRoomCode);
        
        // STOMP를 통해 방 변경 알림
        String destination = "/topic/chat/" + newRoomCode;
        messagingTemplate.convertAndSend(destination, 
            Map.of("type", "USER_SWITCH", "userCode", userCode));
            
        log.debug("User {} switched to room {}", userCode, newRoomCode);
    }

    // 사용자 상태 메시지 생성
    private ChatUserStatusDTO createRoomStatusMessage(String userCode, int roomCode, boolean isOnline) {
        return ChatUserStatusDTO.builder()
                .userCode(userCode)
                .roomCode(roomCode)
                .isOnline(isOnline)
                .build();
    }

    // 상태 메시지 Redis와 STOMP로 전송
    private void publishRoomStatusMessage(ChatUserStatusDTO message, int roomCode) {
        // Redis pub/sub을 통한 서버 간 동기화
        redisPublisher.publish(RedisKeyUtil.getRoomStatusChannelKey(), message);
        log.debug("Published status message for user {} in room {}", 
                 message.getUserCode(), message.getRoomCode());
    }
}
