package com.collabit.chat.service;
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

    // 읽지 않은 메시지 수 반환
    public int getUnreadMessagesCount(int roomCode, String userCode) {
        String keyPattern = "chat_message:" + roomCode;
        Object unreadCount = redisTemplate.opsForHash().get(keyPattern, userCode);
        return unreadCount != null ? Integer.parseInt(unreadCount.toString()) : 0;
    }

    // 모든 읽지 않은 메시지 수 반환 (사용자 기준)
    public List<Integer> getUnreadChatRoomForUser(String userCode) {
        String keyPattern = "chat_message:*";
        return redisTemplate.keys(keyPattern).stream()
                .filter(key -> redisTemplate.opsForHash().hasKey(key, userCode))
                .map(key -> Integer.parseInt(key.split(":")[1]))
                .collect(Collectors.toList());
    }

    // 메시지 상태 업데이트
    public void updateRoomMessageStatus(int roomCode, String userCode, boolean isRead) {
        String key =  "chat_message:" + roomCode;
        if (isRead) redisTemplate.opsForHash().delete(key, userCode);
        else redisTemplate.opsForHash().increment(key, userCode, 1);
        log.debug("Updated message status for sender {} and receiver {} in room {}: read={}",
                userCode, roomCode, isRead);
    }

}
