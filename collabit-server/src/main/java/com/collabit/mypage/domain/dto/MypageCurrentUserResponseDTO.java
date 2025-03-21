package com.collabit.mypage.domain.dto;

import lombok.*;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Getter
public class MypageCurrentUserResponseDTO {
    private String email;
    private String githubId;
    private String nickname;
    private String profileImage;
}
