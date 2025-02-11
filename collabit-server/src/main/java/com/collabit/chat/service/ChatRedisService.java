package com.collabit.chat.service;
import com.collabit.chat.redis.RedisKeyUtil;
import com.collabit.chat.repository.ChatRoomRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ChatRedisService {

    private final RedisTemplate<String, Object> redisTemplate;

    public ChatRedisService(RedisConnectionFactory redisConnectionFactory) {
        this.redisTemplate = new RedisTemplate<>();
        this.redisTemplate.setConnectionFactory(redisConnectionFactory);
        Jackson2JsonRedisSerializer<Object> serializer = new Jackson2JsonRedisSerializer<>(Object.class);
        redisTemplate.setDefaultSerializer(serializer);
        redisTemplate.afterPropertiesSet();
    }

    // 채팅방에 사용자 추가
    public void addUserToRoom(int roomCode, String userCode) {
        String key = RedisKeyUtil.getRoomUsersKey(roomCode);
        redisTemplate.opsForSet().add(key, userCode);
        log.debug("Added user {} to room {}", userCode, roomCode);
    }

    // 채팅방에서 사용자 제거
    public void removeUserFromRoom(int roomCode, String userCode) {
        String key = RedisKeyUtil.getRoomUsersKey(roomCode);
        redisTemplate.opsForSet().remove(key, userCode);
        log.debug("Removed user {} from room {}", userCode, roomCode);
    }

    // 특정 채팅방 사용자 목록 조회
    public List<String> getUsersInRoom(int roomCode) {
        String key = RedisKeyUtil.getRoomUsersKey(roomCode);
        return redisTemplate.opsForSet().members(key).stream()
                .map(Object::toString)
                .collect(Collectors.toList());
    }

    // 사용자 상태 업데이트
    public void updateUserStatus(String userCode, boolean isOnline) {
        String key = RedisKeyUtil.getOnlineUsersKey();
        if (isOnline) {
            redisTemplate.opsForSet().add(key, userCode);
        } else {
            redisTemplate.opsForSet().remove(key, userCode);
        }
        log.debug("Updated user {} status: online={}", userCode, isOnline);
    }

    // 읽지 않은 메시지 수 반환
    public int getUnreadMessagesCount(int roomCode, String userCode) {
        String key = RedisKeyUtil.getChatMessageChannelKey(roomCode);
        Object unreadCount = redisTemplate.opsForHash().get(key, userCode);
        return unreadCount != null ? Integer.parseInt(unreadCount.toString()) : 0;
    }

    // 모든 읽지 않은 메시지 수 반환 (사용자 기준)
    public int getUnreadMessagesForUser(String userCode) {
        String key = RedisKeyUtil.getOnlineUsersKey();
        return redisTemplate.opsForHash().entries(key).values().stream()
                .mapToInt(value -> Integer.parseInt(value.toString()))
                .sum();
    }

    // 메시지 상태 업데이트
    public void updateRoomMessageStatus(int roomCode, String userCode, boolean isRead) {
        String key = RedisKeyUtil.getChatMessageChannelKey(roomCode);
        System.out.println("✅  메시지 상태 업데이트 합니다!");

        System.out.println("✅  메시지 상태 !" + isRead);

        // 메시지 읽기 처리
        if (isRead) {
            // 수신자가 메시지를 읽었으면, UnreadCount 삭제
            redisTemplate.opsForHash().delete(key, userCode);
            System.out.println("전체 결과!!" + redisTemplate.opsForHash().entries(key));
            log.debug("수신자가 메시지를 읽었음! Removed room {} from user {}", roomCode, userCode);
        } else {
            redisTemplate.opsForHash().increment(key, userCode, 1);
        }
        log.debug("Updated message status for sender {} and receiver {} in room {}: read={}",
                userCode, roomCode, isRead);
    }

}
