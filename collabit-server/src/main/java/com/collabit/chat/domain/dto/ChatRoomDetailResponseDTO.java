package com.collabit.chat.domain.dto;

import lombok.*;

@Getter
@Setter
@Builder
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class ChatRoomDetailResponseDTO {
    String nickname;
    String profileImage;
}
