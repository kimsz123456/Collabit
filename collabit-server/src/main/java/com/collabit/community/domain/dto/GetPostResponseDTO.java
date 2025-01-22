package com.collabit.community.domain.dto;

import lombok.*;

import java.time.LocalDateTime;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GetPostResponseDTO {
    int code;
    String userCode;
    String content;
    String[] images;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
