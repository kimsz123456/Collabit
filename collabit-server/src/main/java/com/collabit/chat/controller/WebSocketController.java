package com.collabit.chat.controller;

import com.collabit.chat.domain.dto.ChatRoomSwitchDTO;
import com.collabit.chat.domain.dto.WebSocketMessageDTO;
import com.collabit.chat.exception.MessageContentEmptyException;
import com.collabit.chat.service.ChatRedisService;
import com.collabit.chat.service.WebSocketService;
import com.collabit.global.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketController {

    private final WebSocketService webSocketService;
    private final ChatRedisService chatRedisService;

    // 연결 설정
    @MessageMapping("/chat.connect/{roomCode}")
    @SendTo("/chat/{roomCode}")
    public String connectToRoom(@PathVariable int roomCode, SimpMessageHeaderAccessor headerAccessor) {
        String userCode = getUserCodeFromHeader(headerAccessor);
        webSocketService.handleUserEnter(roomCode, userCode);
        chatRedisService.updateUserStatus(userCode, true);
        log.debug("User {} connected to room {}", userCode, roomCode);
        return "구독 성공: " + roomCode;
    }

    // 메시지 전송
    @MessageMapping("/chat.message/{roomCode}")
    @SendTo("/chat/{roomCode}")
    public WebSocketMessageDTO sendMessageToRoom(WebSocketMessageDTO message,
                                                 SimpMessageHeaderAccessor headerAccessor) {
        String userCode = getUserCodeFromHeader(headerAccessor);

        if (message == null || message.getMessage() == null) {
            throw new MessageContentEmptyException();
        }

        // 채팅 메시지 처리
        webSocketService.handleChatMessage(message, userCode);
        log.debug("Message sent to room {}: {}", message.getRoomCode(), message);

        // 메시지가 수신되면 해당 채팅방 리스트 갱신
        // 메시지가 전송된 후에 리스트를 갱신하고, 읽지 않은 메시지 수를 증가시킴
        return message;
    }

    // 연결 해제
    @MessageMapping("/chat.disconnect/{roomCode}")
    public void disconnect(@PathVariable int roomCode, SimpMessageHeaderAccessor headerAccessor) {
        String userCode = getUserCodeFromHeader(headerAccessor);
        chatRedisService.updateUserStatus(userCode, false);
        webSocketService.handleUserExit(roomCode, userCode);
        log.debug("User {} disconnected from room {}", userCode, roomCode);
    }

    // 채팅방 이동
    @MessageMapping("/chat.switchRoom")
    public void switchRoom(ChatRoomSwitchDTO switchDTO, SimpMessageHeaderAccessor headerAccessor) {
        String userCode = getUserCodeFromHeader(headerAccessor);
        webSocketService.switchUserRoom(userCode, switchDTO);
        log.debug("User {} switched room: {}", userCode, switchDTO);
    }

    private String getUserCodeFromHeader(SimpMessageHeaderAccessor headerAccessor) {
        if (headerAccessor.getUser() instanceof Authentication auth
                && auth.getPrincipal() instanceof CustomUserDetails userDetails) {
            return userDetails.getCode();
        }
        throw new RuntimeException("인증되지 않은 사용자입니다.");
    }

}
