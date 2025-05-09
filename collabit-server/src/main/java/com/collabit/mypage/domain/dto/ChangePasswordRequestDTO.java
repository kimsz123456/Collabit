package com.collabit.mypage.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
public class ChangePasswordRequestDTO {
    @NotBlank(message = "새 비밀번호를 입력해주세요")
    @Pattern(regexp = "^(?=.*[a-zA-Z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,}$",
            message = "비밀번호는 영문, 숫자, 특수문자를 포함한 8자리 이상입니다.")
    private String newPassword;

}
