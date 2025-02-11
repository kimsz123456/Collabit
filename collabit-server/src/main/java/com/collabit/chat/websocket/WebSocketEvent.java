package com.collabit.chat.websocket;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

public class WebSocketEvent {
    
    @Getter
    @RequiredArgsConstructor
    public static class UserConnectEvent {
        private final String nickname;
    }
    
    @Getter
    @RequiredArgsConstructor
    public static class UserSubscribeEvent {
        private final String nickname;
        private final int roomCode;
    }
    
    @Getter
    @RequiredArgsConstructor
    public static class UserDisconnectEvent {
        private final String nickname;
    }
} 