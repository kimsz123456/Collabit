package com.collabit.chat.repository;

import com.collabit.chat.domain.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    //채팅방 메시지 목록 최신순
    Page<ChatMessage> findByRoomCodeOrderByTimestampDesc(int roomCode, Pageable pageable);

    //채팅방별 최신 메시지
    ChatMessage findTopByRoomCodeOrderByTimestampDesc(int roomCode);
}
