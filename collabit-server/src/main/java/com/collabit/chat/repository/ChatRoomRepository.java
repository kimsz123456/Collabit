package com.collabit.chat.repository;

import com.collabit.chat.domain.entity.ChatRoom;
import com.collabit.user.domain.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Integer> {
    //유니크 코드로 채팅방 찾기
    Optional<ChatRoom> findByUniqueCode(String uniqueCode);

    //유저가 속한 모든 채팅방 확인
    Page<ChatRoom> findByUser1OrUser2(User user1, User user2, Pageable pageable);
}
