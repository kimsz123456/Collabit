package com.collabit.community.domain.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GetCommentResponseDTO {
    int code;
    int postCode;
    String userCode;
    String content;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    int parentCommentCode;
    boolean isDeleted;
}
