package com.collabit.chat.service;

import com.collabit.chat.domain.dto.*;
import com.collabit.chat.redis.RedisPublisher;
import com.collabit.chat.redis.RedisKeyUtil;
import com.collabit.chat.websocket.WebSocketSessionManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import static org.mockito.Mockito.*;

public class WebSocketServiceTest {

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private RedisPublisher redisPublisher;

    @Mock
    private ChatRedisService chatRedisService;

    @Mock
    private WebSocketSessionManager webSocketSessionManager;

    @Mock
    private ChatRoomDetailService chatRoomDetailService;

    @InjectMocks
    private WebSocketService webSocketService;

    private ChatUserStatusDTO userStatusMessage;
    private WebSocketMessageDTO webSocketMessage;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        userStatusMessage = new ChatUserStatusDTO();
        userStatusMessage.setUserCode("user1");
        userStatusMessage.setOnline(true);
        userStatusMessage.setRoomCode(123);

        webSocketMessage = new WebSocketMessageDTO();
//        webSocketMessage.setMessageType("MESSAGE");
        webSocketMessage.setNickname("user1");
        webSocketMessage.setRoomCode(123);
        webSocketMessage.setMessage("Test message");
    }

    @Test
    void testHandleChatMessage() {
        // Given
        String userCode = "user1";

        // When
        webSocketService.handleChatMessage(webSocketMessage, userCode);

        // Then
        verify(redisPublisher, times(1)).publish(anyString(), eq(webSocketMessage));
        verify(messagingTemplate, times(1)).convertAndSend(anyString(), eq(webSocketMessage));
    }

    @Test
    void testHandleUserEnter() {
        // Given
        String userCode = "user1";
        int roomCode = 123;

        // When
        webSocketService.handleUserEnter(roomCode, userCode);

        // Then
        verify(chatRedisService, times(1)).addUserToRoom(roomCode, userCode);
        verify(redisPublisher, times(1)).publish(eq(RedisKeyUtil.getRoomStatusChannelKey()), eq(userStatusMessage));
        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/room/" + roomCode), eq(userStatusMessage));
    }

    @Test
    void testHandleUserExit() {
        // Given
        String userCode = "user1";
        int roomCode = 123;

        // When
        webSocketService.handleUserExit(roomCode, userCode);

        // Then
        verify(chatRedisService, times(1)).removeUserFromRoom(roomCode, userCode);
        userStatusMessage.setOnline(false);

        // Verify that publish was called with the correct arguments (content comparison)
        verify(redisPublisher, times(1)).publish(eq(RedisKeyUtil.getRoomStatusChannelKey()), eq(userStatusMessage));
        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/room/" + roomCode), eq(userStatusMessage));
    }


    @Test
    void testSwitchUserRoom() {
        // Given
        String userCode = "user1";
        ChatRoomSwitchDTO switchDTO = new ChatRoomSwitchDTO();
        switchDTO.setNewRoomCode(456);

        // Mock current room code retrieval
//        when(webSocketSessionManager.getRoomCodeFromSession(userCode)).thenReturn(123);

        // When
        webSocketService.switchUserRoom(userCode, switchDTO);

        // Then
        // Verify that the session was updated and Redis state was published
//        verify(webSocketSessionManager, times(1)).switchRoom(userCode, 456);
        verify(redisPublisher, times(1)).publish(eq(RedisKeyUtil.getRoomStatusChannelKey()), eq("User user1 switched rooms."));
        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/room/456"), eq("User user1 switched rooms."));
    }
}
