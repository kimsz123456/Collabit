package com.collabit.chat.service;

import com.collabit.chat.domain.dto.*;
import com.collabit.chat.domain.entity.ChatMessage;
import com.collabit.chat.domain.entity.ChatRoom;
import com.collabit.chat.repository.ChatMessageRepository;
import com.collabit.chat.repository.ChatRoomRepository;
import com.collabit.global.common.PageResponseDTO;
import com.collabit.user.domain.entity.User;
import com.collabit.user.exception.UserNotFoundException;
import com.collabit.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatRoomListService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatRedisService chatRedisService;
    private final UserRepository userRepository;
    private final ChatRoomDetailService chatRoomDetailService;

    // 닉네임으로 사용자 찾기
    private User getUserByNickname(String nickname) {
        return userRepository.findByNickname(nickname)
                .orElseThrow(() -> {
                    log.debug("User with nickname {} not found", nickname);
                    return new UserNotFoundException();
                });
    }

    // 닉네임으로 채팅방 조회
    public ChatRoomResponseDTO getChatRoomByNickname(String userCode, String nickname) {
        User user = getUserByNickname(nickname);
        String userCode2 = user.getCode();
        String uniqueCode = ChatRoom.generateChatRoomCode(userCode, userCode2);
        Optional<ChatRoom> chatRoom = chatRoomRepository.findByUniqueCode(uniqueCode);
        int roomCode = chatRoom.map(ChatRoom::getCode).orElse(-1);
        log.debug("Chat room code {} for user code {}", roomCode, userCode);

        return ChatRoomResponseDTO.builder()
                .roomCode(roomCode)
                .build();
    }

    // 채팅방 생성
    public ChatRoomResponseDTO saveChatRoom(String userCode, ChatRoomRequestDTO requestDTO) {
        String nickname = requestDTO.getNickname();
        User user = getUserByNickname(nickname);
        String userCode2 = user.getCode();
        // 채팅방 고유 코드 생성
        String uniqueCode = ChatRoom.generateChatRoomCode(userCode, userCode2);
        // 채팅방 중복 확인 또는 새 채팅방 생성
        ChatRoom chatRoom = chatRoomRepository.findByUniqueCode(uniqueCode)
                .orElseGet(() -> createNewChatRoom(userCode, userCode2, uniqueCode));
        log.debug("Chat room code {} for user code {}", chatRoom.getCode(), userCode);
        ChatMessageRequestDTO chatMessageRequestDTO = ChatMessageRequestDTO.builder().message(requestDTO.getMessage()).timestamp(LocalDateTime.now()).build();
        chatRoomDetailService.saveMessage(chatMessageRequestDTO, userCode, chatRoom.getCode());
        return buildChatRoomResponseDTO(chatRoom);
    }

    // 새 채팅방 생성
    private ChatRoom createNewChatRoom(String userCode1, String userCode2, String uniqueCode) {
        User user1 = userRepository.findById(userCode1).orElseThrow(UserNotFoundException::new);
        User user2 = userRepository.findById(userCode2).orElseThrow(UserNotFoundException::new);
        log.debug("Creating new chat room {}", uniqueCode);
        return chatRoomRepository.save(
                ChatRoom.builder()
                        .user1(user1)
                        .user2(user2)
                        .uniqueCode(uniqueCode)
                        .build()
        );
    }

    // ChatRoomResponseDTO 생성
    private ChatRoomResponseDTO buildChatRoomResponseDTO(ChatRoom chatRoom) {
        return ChatRoomResponseDTO.builder()
                .roomCode(chatRoom.getCode())
                .build();
    }

    public PageResponseDTO<ChatRoomListResponseDTO> getChatRoomList(String userCode, int pageNumber) {
        int size = 15;
        Pageable pageable = PageRequest.of(pageNumber, size, Sort.by(Sort.Order.desc("updatedAt")));
        User user = userRepository.findById(userCode).orElseThrow();
        // 채팅방 리스트 조회
        Page<ChatRoom> chatRoomPage = chatRoomRepository.findByUser1OrUser2(user, user, pageable);
        log.debug("Chat room count {}", chatRoomPage.toString());
        // 채팅방 리스트를 생성하고, 각 채팅방의 최신 메시지와 함께 반환
        List<ChatRoomListResponseDTO> chatRoomList = chatRoomPage.getContent().stream()
                .map(chatRoom -> buildChatRoomListResponse(chatRoom, userCode)) // 최신 메시지 시간 포함하여 생성
                .sorted(Comparator.comparing(ChatRoomListResponseDTO::getLastMessageTime).reversed()) // 최신 메시지 기준으로 한 번 더 정렬
                .collect(Collectors.toList());
        return PageResponseDTO.<ChatRoomListResponseDTO>builder()
                .content(chatRoomList)
                .pageNumber(pageNumber)
                .pageSize(size)
                .totalElements((int) chatRoomPage.getTotalElements())
                .totalPages(chatRoomPage.getTotalPages())
                .last(chatRoomPage.isLast())
                .hasNext(chatRoomPage.hasNext())
                .build();
    }


    // Redis와 연동하여 채팅방 리스트 응답 DTO 생성
    private ChatRoomListResponseDTO buildChatRoomListResponse(ChatRoom chatRoom, String userCode) {
        ChatMessage lastMessage = chatMessageRepository.findTopByRoomCodeOrderByTimestampDesc(chatRoom.getCode());
        int unreadCount = chatRedisService.getUnreadMessagesCount(chatRoom.getCode(), userCode);

        // 상대 유저 정보 조회
        User otherUser = getOtherUser(chatRoom, userCode);
        return ChatRoomListResponseDTO.builder()
                .roomCode(chatRoom.getCode())
                .lastMessage(lastMessage != null ? lastMessage.getMessage() : null)
                .lastMessageTime(lastMessage != null ? lastMessage.getTimestamp() : null)
                .unreadMessageCount(unreadCount)
                .nickname(otherUser.getNickname())
                .profileImage(otherUser.getProfileImage())
                .build();
    }

    // 상대 유저 정보 가져오기
    private User getOtherUser(ChatRoom chatRoom, String userCode) {
        return chatRoom.getUser1().getCode().equals(userCode) ? chatRoom.getUser2() : chatRoom.getUser1();
    }

}
