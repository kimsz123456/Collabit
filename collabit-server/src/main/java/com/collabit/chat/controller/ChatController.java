package com.collabit.chat.controller;

import com.collabit.chat.domain.dto.*;
import com.collabit.chat.service.ChatRoomDetailService;
import com.collabit.chat.service.ChatRoomListService;
import com.collabit.global.common.PageResponseDTO;
import com.collabit.global.security.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "ChatController", description = "채팅 API")
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/chat")
@Slf4j
public class ChatController {

    private final ChatRoomListService chatRoomListService;
    private final ChatRoomDetailService chatRoomDetailService;

    @Operation(summary = "채팅방 생성 또는 조회", description = "채팅방을 생성하거나 존재하는 채팅방을 조회합니다.")
    @PostMapping("/rooms")
    public ResponseEntity<ChatRoomResponseDTO> getOrCreateChatRoom(@RequestBody ChatRoomRequestDTO requestDTO) {
        String userCode = SecurityUtil.getCurrentUserCode();
        ChatRoomResponseDTO responseDTO = chatRoomListService.saveChatRoom(userCode, requestDTO);
        log.debug("Chat room created/retrieved - user: {}, room: {}", userCode, responseDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
    }

    @Operation(summary = "채팅방 목록 조회", description = "사용자의 채팅방 목록을 조회합니다.")
    @GetMapping("/rooms")
    public ResponseEntity<PageResponseDTO<ChatRoomListResponseDTO>> getChatRoomList(@RequestParam("pageNumber") int pageNumber) {
        log.debug("getChatRoomList requestDTO: {}", pageNumber);
        String userCode = SecurityUtil.getCurrentUserCode();
        PageResponseDTO<ChatRoomListResponseDTO> responseDTO = chatRoomListService.getChatRoomList(userCode,pageNumber);
        log.debug("getChatRoomList responseDTO: {}", responseDTO.toString());
        if (responseDTO.getContent().isEmpty()) return ResponseEntity.noContent().build();
        return ResponseEntity.status(HttpStatus.OK).body(responseDTO);
    }

    @Operation(summary = "채팅방 세부정보 조회", description = "채팅방의 세부정보를 조회합니다.")
    @GetMapping("/rooms/{roomCode}")
    public ResponseEntity<ChatRoomDetailResponseDTO> getChatRoomDetail(@PathVariable int roomCode) {
        String userCode = SecurityUtil.getCurrentUserCode();
        ChatRoomDetailResponseDTO responseDTO = chatRoomDetailService.getChatRoomDetail(userCode, roomCode);
        return ResponseEntity.status(HttpStatus.OK).body(responseDTO);
    }

    @Operation(summary = "채팅방 메시지 조회", description = "채팅방의 메시지를 조회합니다.")
    @GetMapping("/rooms/{roomCode}/messages")
    public ResponseEntity<PageResponseDTO<ChatMessageResponseDTO>> getChatMessages(
            @PathVariable int roomCode,
            @RequestParam("pageNumber") int pageNumber) {
        String userCode = SecurityUtil.getCurrentUserCode();
        PageResponseDTO<ChatMessageResponseDTO> responseDTO =
            chatRoomDetailService.getChatRoomMessages(userCode, roomCode, pageNumber);

        if (responseDTO.getContent().isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        chatRoomDetailService.markMessagesAsRead(roomCode, userCode);
        log.debug("Messages retrieved and marked as read - room: {}, user: {}", roomCode, userCode);
        return ResponseEntity.ok(responseDTO);
    }

    @Operation(summary = "읽지 않은 메시지 조회", description = "사용자가 읽지 않은 메시지 수를 조회합니다.")
    @GetMapping("/messages/unread")
    public ResponseEntity<ChatUnreadResponseDTO> getUnreadMessages() {
        String userCode = SecurityUtil.getCurrentUserCode();
        ChatUnreadResponseDTO responseDTO = chatRoomListService.getUnreadMessagesCount(userCode);
        log.debug("getUnreadMessages responseDTO: {}", responseDTO.toString());
        return ResponseEntity.ok(responseDTO);
    }

    @Operation(summary = "닉네임으로 채팅방 조회", description = "닉네임을 기반으로 채팅방을 조회합니다.")
    @PostMapping("/rooms/search")
    public ResponseEntity<ChatRoomResponseDTO> getChatRoomWithNickname(@RequestParam("nickname") String nickname) {
        log.debug("getChatRoomWithNickname requestDTO: {}", nickname);
        String userCode = SecurityUtil.getCurrentUserCode();
        ChatRoomResponseDTO responseDTO = chatRoomListService.getChatRoomByNickname(userCode, nickname);
        log.debug("getChatRoomWithNickname responseDTO: {}", responseDTO.toString());
        if (responseDTO.getRoomCode() == 0) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(responseDTO);
    }

    @Operation(summary = "채팅 메시지 읽음 처리", description = "현재 보고 있는 채팅방의 메시지를 읽음처리합니다.")
    @GetMapping("/rooms/{roomCode}/messages/read")
    public ResponseEntity<?> markMessagesRead(@PathVariable int roomCode) {
        String userCode = SecurityUtil.getCurrentUserCode();
        chatRoomDetailService.markMessagesAsRead(roomCode, userCode);
        return ResponseEntity.ok().build();
    }
}
