package com.collabit.mypage.domain.dto;

import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Getter
@Setter
public class ChangeProfileImageRequestDTO {
    private MultipartFile newProfileImage;
}
