package com.collabit.mypage.service;

import com.collabit.global.common.ErrorCode;
import com.collabit.global.error.exception.BusinessException;
import com.collabit.mypage.domain.dto.MypageCurrentUserDTO;
import com.collabit.user.domain.dto.GetCurrentUserResponseDTO;
import com.collabit.user.domain.entity.User;
import com.collabit.user.exception.UserNotFoundException;
import com.collabit.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class MypageService {
    private final UserRepository userRepository;

    // 유저 정보 조회하는 메소드
    public MypageCurrentUserDTO getCurrentUserInfoMypage(String userCode) {
        Optional<User> user = userRepository.findByCode(userCode);

        if (user.isEmpty()) {
            log.debug("User with code {} not found", userCode);
            throw new BusinessException(ErrorCode.DATA_NOT_FOUND);
        }

        return MypageCurrentUserDTO.builder()
                .email(user.get().getEmail())
                .githubId(user.get().getGithubId())
                .nickname(user.get().getNickname())
                .profileImage(user.get().getProfileImage())
                .build();
    }
}
