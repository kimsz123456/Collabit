package com.collabit.chat.service;

import com.collabit.chat.domain.dto.*;
import com.collabit.chat.domain.entity.ChatMessage;
import com.collabit.chat.domain.entity.ChatRoom;
import com.collabit.chat.exception.UserNotInChatRoomException;
import com.collabit.chat.repository.ChatMessageRepository;
import com.collabit.chat.repository.ChatRoomRepository;
import com.collabit.user.domain.entity.Role;
import com.collabit.user.domain.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class ChatRoomDetailServiceTest {

    @Mock
    private ChatMessageRepository chatMessageRepository;

    @Mock
    private ChatRoomRepository chatRoomRepository;

    @Mock
    private ChatRedisService chatRedisService;

    @InjectMocks
    private ChatRoomDetailService chatRoomDetailService;

    private User user1;
    private User user2;
    private ChatRoom chatRoom;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // Mock user1 and user2
        user1 = User.builder()
                .code("user1")
                .email("user1@example.com")
                .password("password")
                .nickname("User1")
                .profileImage("profileImage1")
                .role(Role.ROLE_USER)
                .build();

        user2 = User.builder()
                .code("user2")
                .email("user2@example.com")
                .password("password")
                .nickname("User2")
                .profileImage("profileImage2")
                .role(Role.ROLE_USER)
                .build();

        chatRoom = ChatRoom.builder()
                .code(123)
                .uniqueCode("user1-user2")
                .user1(user1)
                .user2(user2)
                .build();
    }

    @Test
    void testGetChatRoomDetail_UserNotInChatRoom() {
        // Given
        String userCode = "user3";

        // When
        when(chatRoomRepository.findById(123)).thenReturn(Optional.of(chatRoom));

        // Then
        assertThrows(UserNotInChatRoomException.class, () -> {
            chatRoomDetailService.getChatRoomDetail(userCode, 123);
        });
    }

    @Test
    void testGetChatRoomDetail_Success() {
        // Given
        String userCode = "user1";

        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setRoomCode(123);
        chatMessage.setMessage("Test message");
        chatMessage.setTimestamp(LocalDateTime.now());
        chatMessage.setUserCode("user1");

        when(chatRoomRepository.findById(123)).thenReturn(Optional.of(chatRoom));
        when(chatMessageRepository.findByRoomCodeOrderByTimestampDesc(123, PageRequest.of(0, 50)))
                .thenReturn(new PageImpl<>(List.of(chatMessage), PageRequest.of(0, 50), 1));

        // When
        ChatRoomDetailResponseDTO responseDTO = chatRoomDetailService.getChatRoomDetail(userCode, 123);

        // Then
        assertNotNull(responseDTO);
    }

    @Test
    void testMarkMessagesAsRead() {
        // Given
        int roomCode = 123;
        String userCode = "user1";

        // When
        doNothing().when(chatRedisService).updateRoomMessageStatus(roomCode, userCode, true);

        // Then
        chatRoomDetailService.markMessagesAsRead(roomCode, userCode);
        verify(chatRedisService, times(1)).updateRoomMessageStatus(roomCode, userCode, true);
    }

    @Test
    void testSaveMessage() {
        // Given
        ChatMessageRequestDTO chatMessageRequestDTO = ChatMessageRequestDTO.builder()
                .message("Test message")
                .timestamp(LocalDateTime.now())
                .build();
        String userCode = "user1";
        int roomCode = 123;

        ChatMessage savedChatMessage = new ChatMessage();
        savedChatMessage.setRoomCode(roomCode);
        savedChatMessage.setUserCode(userCode);
        savedChatMessage.setMessage(chatMessageRequestDTO.getMessage());
        savedChatMessage.setTimestamp(LocalDateTime.now());
        savedChatMessage.setRead(false);

        when(chatMessageRepository.save(any(ChatMessage.class))).thenReturn(savedChatMessage);

        // When
        chatRoomDetailService.saveMessage(chatMessageRequestDTO, userCode, roomCode);

        // Then
        verify(chatMessageRepository, times(1)).save(any(ChatMessage.class));
    }
}
