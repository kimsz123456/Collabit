package com.collabit.community.domain.dto;

import java.util.List;
import lombok.*;

import java.time.LocalDateTime;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class GetPostResponseDTO {
    private int code;
    private String content;
    private List<String> images;
    private int commentCount;
    private int likeCount;
    private boolean liked;
    private Author author;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
