package com.collabit.chat.domain.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessageResponseDTO {
    private String nickname;
    private String message;
    private LocalDateTime timestamp;
}