package com.collabit.user.domain.dto;

import lombok.*;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GetCurrentUserResponseDTO {
    String githubId;
    String nickname;
    String profileImage;
}
