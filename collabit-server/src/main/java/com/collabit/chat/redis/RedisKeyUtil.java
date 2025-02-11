package com.collabit.chat.redis;

public class RedisKeyUtil {
    public static String getRoomUsersKey(int roomCode) {
        return "room_users:" + roomCode;
    }

    public static String getOnlineUsersKey() {
        return "online_users";
    }

    public static String getChatMessageChannelKey(int roomCode) {
        return "chat_message:" + roomCode;
    }

    public static String getRoomStatusChannelKey() {
        return "room_status";
    }

    public static String getMessageKey(int messageId) {
        return "chat:message:" + messageId;
    }
}
