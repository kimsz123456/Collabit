package com.collabit.chat.websocket;

import com.collabit.chat.domain.dto.WebSocketMessageDTO;
import com.collabit.chat.service.ChatRedisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.context.event.EventListener;

import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
@Lazy
public class WebSocketSessionManager {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatRedisService chatRedisService;
    private final Map<String, Set<String>> roomSubscribers = new ConcurrentHashMap<>();
    private final Map<String, String> userCurrentRoom = new ConcurrentHashMap<>();

    @EventListener
    public void handleUserConnect(WebSocketEvent.UserConnectEvent event) {
        log.debug("User connected: {}", event.getNickname());
    }

    @EventListener
    public void handleUserSubscribe(WebSocketEvent.UserSubscribeEvent event) {
        addUserToRoom(event.getNickname(), event.getRoomCode());
    }

    @EventListener
    public void handleUserDisconnect(WebSocketEvent.UserDisconnectEvent event) {
        handleDisconnect(event.getNickname());
    }

    public void broadcastMessage(int roomCode, String message) {
        String destination = "/topic/chat/" + roomCode;
        try {
            messagingTemplate.convertAndSend(destination, message);
            log.debug("Message broadcast to room {}", roomCode);
        } catch (Exception e) {
            log.error("Failed to broadcast message to room {}", roomCode, e);
        }
    }


    public void addUserToRoom(String nickname, int roomCode) {
        String roomCodeStr = String.valueOf(roomCode);
        removeUserFromCurrentRoom(nickname);
        
        roomSubscribers.computeIfAbsent(roomCodeStr, k -> ConcurrentHashMap.newKeySet())
                      .add(nickname);
        userCurrentRoom.put(nickname, roomCodeStr);
        
        chatRedisService.addUserToRoom(roomCode, nickname);
        log.debug("User {} joined room {}. Current subscribers: {}", 
                 nickname, roomCode, roomSubscribers.get(roomCodeStr));
    }

    public void removeUserFromCurrentRoom(String nickname) {
        String currentRoom = userCurrentRoom.get(nickname);
        if (currentRoom != null) {
            Set<String> subscribers = roomSubscribers.get(currentRoom);
            if (subscribers != null) {
                subscribers.remove(nickname);
                if (subscribers.isEmpty()) {
                    roomSubscribers.remove(currentRoom);
                }
            }
            chatRedisService.removeUserFromRoom(Integer.parseInt(currentRoom), nickname);
            userCurrentRoom.remove(nickname);
            
            log.debug("User {} left room {}. Remaining subscribers: {}", 
                     nickname, currentRoom, subscribers);
        }
    }

    public void handleDisconnect(String nickname) {
        removeUserFromCurrentRoom(nickname);
        log.debug("User {} disconnected and removed from all rooms", nickname);
    }

    public Set<String> getRoomSubscribers(int roomCode) {
        return roomSubscribers.getOrDefault(String.valueOf(roomCode), Collections.emptySet());
    }
}

