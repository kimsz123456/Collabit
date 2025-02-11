package com.collabit.auth.domain.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@AllArgsConstructor
@Builder
@ToString
@NoArgsConstructor
public class UserSignupRequestDTO {

    @NotBlank(message = "이메일을 입력해주세요")
    @Email(message = "올바른 이메일 형식이 아닙니다")
    private String email;


    @NotBlank(message = "닉네임을 입력해주세요")
    @Pattern(regexp = "^.{2,10}$",
    message = "닉네임은 2자 이상 10자 이하로 입력해주세요")
    private String nickname;


    @NotBlank(message = "비밀번호를 입력해주세요")
    @Pattern(regexp = "^(?=.*[a-zA-Z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,}$",
        message = "비밀번호는 영문, 숫자, 특수문자를 포함한 8자리 이상입니다.")
    private String password;

}
