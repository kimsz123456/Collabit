package com.collabit.auth.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Getter
@AllArgsConstructor
@Builder
@ToString
public class UserSignupResponseDTO {

    private String nickname;
    private String profileImage;
    private boolean isGithub;

}
