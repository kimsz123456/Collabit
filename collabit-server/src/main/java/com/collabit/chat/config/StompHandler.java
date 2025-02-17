package com.collabit.chat.config;

import com.collabit.chat.websocket.WebSocketEvent;
import com.collabit.global.security.CustomUserDetails;
import com.collabit.user.exception.UserNotFoundException;
import com.collabit.user.repository.UserRepository;
import com.collabit.user.domain.entity.User;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Objects;

@RequiredArgsConstructor
@Component
@Slf4j
public class StompHandler implements ChannelInterceptor {

    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) throw new RuntimeException("Invalid STOMP message");
        if (StompCommand.CONNECT.equals(accessor.getCommand())) return handleConnect(message, accessor);
        return message;
    }

    private Message<?> handleConnect(Message<?> message, StompHeaderAccessor accessor) {
        try {
            String nickname = extractNickname(accessor);
            User user = userRepository.findByNickname(nickname)
                    .orElseThrow(UserNotFoundException::new);
            Authentication auth = createAuthentication(user);
            accessor.setUser(auth);
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(auth);
            SecurityContextHolder.setContext(context);

            log.debug("WebSocket authentication success: userCode={}", user.getCode());

            eventPublisher.publishEvent(new WebSocketEvent.UserConnectEvent(nickname));
            return message;
        } catch (Exception e) {
            log.error("WebSocket authentication failed: {}", e.getMessage());
            throw new RuntimeException("WebSocket authentication failed", e);
        }
    }

    private String extractNickname(StompHeaderAccessor accessor) {
        return Objects.requireNonNull(accessor.getNativeHeader("nickname")).stream()
                .findFirst()
                .filter(nick -> !nick.isBlank())
                .orElseThrow(() -> new RuntimeException("Nickname is required"));
    }

    private Authentication createAuthentication(User user) {
        CustomUserDetails userDetails = new CustomUserDetails(
                user.getCode(),
                user.getEmail(),
                null,
                user.getNickname(),
                user.getGithubId(),
                user.getProfileImage(),
                Collections.emptyList()
        );

        return new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                userDetails.getAuthorities()
        );
    }

    @Override
    public void afterSendCompletion(Message<?> message, MessageChannel channel, boolean sent, Exception ex) {
        SecurityContextHolder.clearContext();
        if (ex != null) {
            log.error("Message sending failed: {}", ex.getMessage());
        } else {
            StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
            if (accessor != null && StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
                handleSubscribe(accessor);
            } else if (accessor != null && StompCommand.DISCONNECT.equals(accessor.getCommand())) {
                handleDisconnect(accessor);
            }
        }
    }

    private void handleSubscribe(StompHeaderAccessor accessor) {
        if (accessor.getUser() == null) {
            throw new RuntimeException("Unauthorized subscription attempt");
        }
        String destination = accessor.getDestination();
        if (destination != null && destination.startsWith("/topic/chat/")) {
            try {
                int roomCode = Integer.parseInt(destination.substring(destination.lastIndexOf('/') + 1));
                String nickname = accessor.getUser().getName();
                eventPublisher.publishEvent(new WebSocketEvent.UserSubscribeEvent(nickname, roomCode));
                log.debug("User {} subscribed to room {}", nickname, roomCode);
            } catch (Exception e) {
                log.error("Failed to process subscription", e);
                throw new RuntimeException("Invalid subscription request", e);
            }
        }
    }

    private void handleDisconnect(StompHeaderAccessor accessor) {
        if (accessor.getUser() != null) {
            String nickname = accessor.getUser().getName();
            eventPublisher.publishEvent(new WebSocketEvent.UserDisconnectEvent(nickname));
            SecurityContextHolder.clearContext();
            log.debug("User {} disconnected", nickname);
        }
    }
}
