package com.collabit.community.domain.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class GetCommentResponseDTO {
    int code;
    int postCode;
    Author author;
    String content;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    Integer parentCommentCode;
    boolean isDeleted;
    @Builder.Default
    List<GetCommentResponseDTO> replies = new ArrayList<>();
}
