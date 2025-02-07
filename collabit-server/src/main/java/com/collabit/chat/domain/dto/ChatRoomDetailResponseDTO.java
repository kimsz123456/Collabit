package com.collabit.chat.domain.dto;

import com.collabit.global.common.PageResponseDTO;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class ChatRoomDetailResponseDTO {
    int roomCode;
    String nickname;
    String profileImage;
}
