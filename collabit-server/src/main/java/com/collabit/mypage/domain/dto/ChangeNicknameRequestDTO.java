package com.collabit.mypage.domain.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;



@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Getter
public class ChangeNicknameRequestDTO {

    @NotBlank(message = "닉네임을 입력해주세요")
    @Pattern(regexp = "^.{2,10}$",
            message = "닉네임은 2자 이상 10자 이하로 입력해주세요")
    private String nickname;
}

