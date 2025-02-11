package com.collabit.chat.service;

import com.collabit.chat.domain.dto.*;
import com.collabit.chat.domain.entity.ChatRoom;
import com.collabit.chat.repository.ChatMessageRepository;
import com.collabit.chat.repository.ChatRoomRepository;
import com.collabit.global.common.PageResponseDTO;
import com.collabit.user.domain.entity.Role;
import com.collabit.user.domain.entity.User;
import com.collabit.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class ChatRoomListServiceTest {

    @Mock
    private ChatRoomRepository chatRoomRepository;

    @Mock
    private ChatRedisService chatRedisService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ChatRoomListService chatRoomListService;

    private User user1;
    private User user2;

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

        userRepository.save(user1);
        userRepository.save(user2);
    }

    @Test
    void testGetChatRoomByNickname() {
        // Given
        String userCode = "user1";
        ChatRoom chatRoom = new ChatRoom();
        chatRoom.setCode(123);
        chatRoom.setUniqueCode("user1-user2");

        when(userRepository.findByNickname("user2")).thenReturn(Optional.of(user2));
        when(chatRoomRepository.findByUniqueCode("user1-user2")).thenReturn(Optional.of(chatRoom));

        // When
        ChatRoomResponseDTO responseDTO = chatRoomListService.getChatRoomByNickname(userCode, "user2");

        // Then
        assertNotNull(responseDTO);
        assertEquals(123, responseDTO.getRoomCode());
    }

    @Test
    void testSaveChatRoomWhenRoomAlreadyExists() {
        // Given
        String userCode = "user1";
        ChatRoomRequestDTO requestDTO = new ChatRoomRequestDTO("user2", "Text message");
        ChatRoom existingChatRoom = new ChatRoom();
        existingChatRoom.setCode(123);
        existingChatRoom.setUniqueCode("user1-user2");

        when(userRepository.findByNickname("user2")).thenReturn(Optional.of(user2));
        when(chatRoomRepository.findByUniqueCode("user1-user2")).thenReturn(Optional.of(existingChatRoom));

        // When
        ChatRoomResponseDTO responseDTO = chatRoomListService.saveChatRoom(userCode, requestDTO);

        // Then
        assertNotNull(responseDTO);
        assertEquals(123, responseDTO.getRoomCode());
    }

    @Test
    void testSaveChatRoomWhenRoomDoesNotExist() {
        // Given
        String userCode = "user1";
        ChatRoomRequestDTO requestDTO = new ChatRoomRequestDTO("user2", "Text message");
        String uniqueCode = "user1-user2";

        when(userRepository.findByNickname("user2")).thenReturn(Optional.of(user2));
        when(userRepository.findById(userCode)).thenReturn(Optional.of(user1));
        when(userRepository.findById("user2")).thenReturn(Optional.of(user2));
        when(chatRoomRepository.findByUniqueCode(uniqueCode)).thenReturn(Optional.empty());
        when(chatRoomRepository.save(any(ChatRoom.class))).thenReturn(new ChatRoom());

        // When
        ChatRoomResponseDTO responseDTO = chatRoomListService.saveChatRoom(userCode, requestDTO);

        // Then
        assertNotNull(responseDTO);
    }

    @Test
    void testGetChatRoomList() {
        // Given
        String userCode = "user1";
        ChatRoom chatRoom = ChatRoom.builder()
                .code(123)
                .uniqueCode("user1-user2")
                .user1(user1)
                .user2(user2)
                .build();

        // when
        when(userRepository.findById(userCode)).thenReturn(Optional.of(user1));

        Page<ChatRoom> chatRoomPage = new PageImpl<>(List.of(chatRoom), PageRequest.of(0, 15), 1);
        when(chatRoomRepository.findByUser1OrUser2(user1, user1, PageRequest.of(0, 15)))
                .thenReturn(chatRoomPage);

        // When
        PageResponseDTO<List<ChatRoomListResponseDTO>> responseDTO = chatRoomListService.getChatRoomList(userCode, 0);

        // Then
        assertNotNull(responseDTO);
        assertEquals(1, responseDTO.getTotalElements());
        assertEquals(123, ((ChatRoomListResponseDTO)((List<?>)responseDTO.getContent()).get(0)).getRoomCode());
        assertTrue(((ChatRoomListResponseDTO)((List<ChatRoomListResponseDTO>)responseDTO.getContent()).get(0)).getLastMessage() == null);
    }



    @Test
    void testGetUnreadMessagesCount() {
        // Given
        String userCode = "user1";
        when(chatRedisService.getUnreadMessagesForUser(userCode)).thenReturn(5);

        // When
        ChatUnreadResponseDTO responseDTO = chatRoomListService.getUnreadMessagesCount(userCode);

        // Then
        assertNotNull(responseDTO);
        assertTrue(responseDTO.isExist());
    }
}
