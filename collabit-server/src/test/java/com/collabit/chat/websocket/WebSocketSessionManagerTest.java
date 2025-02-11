package com.collabit.chat.websocket;

import com.collabit.chat.domain.dto.WebSocketMessageDTO;
import com.collabit.chat.service.ChatRedisService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.socket.WebSocketSession;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

public class WebSocketSessionManagerTest {

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private ChatRedisService chatRedisService;

    @Mock
    private WebSocketSession session;

    @Mock
    private ConcurrentHashMap<String, Object> sessionAttributes;

    @InjectMocks
    private WebSocketSessionManager webSocketSessionManager;

    private WebSocketMessageDTO messageDTO;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        session = mock(WebSocketSession.class);
        when(session.getAttributes()).thenReturn(sessionAttributes);

        session.getAttributes().put("roomCode", 123);
        webSocketSessionManager.sessions.put("user1", session);

        when(sessionAttributes.get("roomCode")).thenReturn(123);
        when(chatRedisService.getUsersInRoom(123)).thenReturn(List.of("user1", "user2"));

        messageDTO = new WebSocketMessageDTO();
        messageDTO.setRoomCode(123);
        messageDTO.setMessageType("MESSAGE");
        messageDTO.setMessage("Test message");
    }

    @Test
    void testGetSession() {
        // Given
        String userCode = "user1";

        // When
        webSocketSessionManager.getSession(userCode);

        // Then
        assertNotNull(webSocketSessionManager.getSession(userCode));
    }

    @Test
    void testGetRoomCodeFromSession() {
        // Given
        String userCode = "user1";

        // When
        int roomCode = webSocketSessionManager.getRoomCodeFromSession(userCode);

        // Then
        assertEquals(123, roomCode);
    }

    @Test
    void testSendDirectMessage() {
        // Given
        WebSocketMessageDTO message = new WebSocketMessageDTO();
        message.setRoomCode(123);
        message.setMessage("Test message");

        // When
        webSocketSessionManager.sendDirectMessage(message);

        // Then
        verify(messagingTemplate, times(1)).convertAndSend("/topic/room/123", message);
    }

    @Test
    void testBroadcastMessage() {
        // Given
        String messageContent = "Broadcast message";
        int roomCode = 123;

        // When
        webSocketSessionManager.broadcastMessage(roomCode, messageContent);

        // Then
        verify(messagingTemplate, times(2)).convertAndSend(eq("/topic/room/123"), any(WebSocketMessageDTO.class));
    }

    @Test
    void testSwitchRoom() {
        // Given
        String userCode = "user1";
        int newRoomCode = 456;

        // Mock WebSocketSession and sessionAttributes
        WebSocketSession userSession = mock(WebSocketSession.class);

        // Mock session to return sessionAttributes
        when(userSession.getAttributes()).thenReturn(sessionAttributes);

        // When: Calling the switchRoom method
//        webSocketSessionManager.switchRoom(userCode, newRoomCode);

        // Then
        // Verify that roomCode is updated in sessionAttributes
        verify(sessionAttributes, times(1)).put("roomCode", newRoomCode);  // Ensure the roomCode is set

        // Verify that Redis operations are called
        verify(chatRedisService, times(1)).removeUserFromRoom(123, userCode);  // old roomCode is 123
        verify(chatRedisService, times(1)).addUserToRoom(newRoomCode, userCode);  // new roomCode is 456

        // Verify that the STOMP message is sent
        verify(messagingTemplate, times(1)).convertAndSend("/topic/room/" + newRoomCode, "User " + userCode + " switched rooms.");
    }


}
