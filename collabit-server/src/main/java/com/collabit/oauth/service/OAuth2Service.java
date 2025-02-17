package com.collabit.oauth.service;

import com.collabit.global.common.ErrorCode;
import com.collabit.global.error.exception.BusinessException;
import com.collabit.global.security.CustomUserDetails;
import com.collabit.global.security.SecurityUtil;
import com.collabit.global.security.TokenProvider;
import com.collabit.oauth.domain.dto.OAuth2UserRequestDTO;
import com.collabit.oauth.domain.enums.OAuth2Status;
import com.collabit.oauth.exception.GithubAlreadyLinkedException;
import com.collabit.oauth.exception.GithubAlreadyUsedException;
import com.collabit.user.domain.entity.Role;
import com.collabit.user.domain.entity.User;
import com.collabit.user.exception.UserNotFoundException;
import com.collabit.user.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
@Transactional
@Slf4j
public class OAuth2Service {
    private final UserRepository userRepository;
    private final TokenProvider tokenProvider;
    private final HttpServletRequest request;

    @Getter
    private OAuth2Status oAuth2Status;

    // 쿠키에 토큰이 있는 경우 연동 처리
    // 토큰이 없는 경우 로그인/회원가입 처리
    public User processOAuth2User(OAuth2UserRequestDTO oauth2UserRequestDTO) {
        // 쿠키에서 토큰 추출 시도
        String accessToken = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("accessToken".equals(cookie.getName())) {
                    accessToken = cookie.getValue();
                    break;
                }
            }
        }

        // 토큰이 있으면 연동 시도로 처리
        if (accessToken != null) {
            if(!tokenProvider.validateToken(accessToken)){
                throw new BusinessException(ErrorCode.INVALID_TOKEN);
            }
            
            // 토큰에서 인증 정보 추출
            Authentication authentication = tokenProvider.getAuthentication(accessToken);
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String userCode = userDetails.getCode();

            return linkGithubAccount(userCode, oauth2UserRequestDTO);
        }
        log.debug("토큰 없음 -> 깃허브 로그인/회원가입 시작");
        return saveOrLoginOAuth2User(oauth2UserRequestDTO);
    }

    // GitHub ID로 기존 사용자 찾아서 있으면 로그인, 없으면 회원가입
    public User saveOrLoginOAuth2User(OAuth2UserRequestDTO oAuth2UserRequestDTO) {
        return userRepository.findByGithubId(oAuth2UserRequestDTO.getGithubId())
                // 해당 GitHub Id가 있으면 로그인 처리
                .map(user -> {
                    oAuth2Status = OAuth2Status.LOGIN_SUCCESS;
                    log.debug("깃허브 로그인 성공");
                    return user;
                })
                // 없으면 회원가입 처리
                .orElseGet(() -> {
                    oAuth2Status = OAuth2Status.SIGNUP_SUCCESS;
                    log.debug("깃허브 회원가입 성공");
                    return signUpOAuth2User(oAuth2UserRequestDTO);
                });
    }

    // 새로운 GitHub 사용자 생성 및 저장
    private User signUpOAuth2User(OAuth2UserRequestDTO oAuth2UserRequestDTO) {
        User newGitUser = User.builder()
                .email(null)
                .password(null)
                .githubId(oAuth2UserRequestDTO.getGithubId())
                .nickname(oAuth2UserRequestDTO.getNickname())
                .profileImage(oAuth2UserRequestDTO.getProfileImage())
                .role(Role.ROLE_USER) // 기본 사용자 권한 설정
                .build();
        log.debug("user 저장 {}", newGitUser.toString());

        return userRepository.save(newGitUser);
    }

    // 일반회원이 GitHub 계정을 연동할 경우 해당 유저 레코드에 깃허브 계정 추가
    public User linkGithubAccount(String userCode, OAuth2UserRequestDTO oAuth2UserRequestDTO) {
        User user = userRepository.findByCode(userCode)
                .orElseThrow(UserNotFoundException::new);

        // 이미 GitHub 계정이 연동된 경우
        if (user.getGithubId() != null) {
            log.debug("이미 GitHub 계정이 연동되어 있음");
            throw new GithubAlreadyLinkedException();
        }

        // GitHub ID가 이미 다른 계정에 연동된 경우 체크
        if (userRepository.existsByGithubId(oAuth2UserRequestDTO.getGithubId())) {
            log.debug("해당 GitHub 계정은 이미 사용중임");
            throw new GithubAlreadyUsedException();
        }

        user.linkGithub(oAuth2UserRequestDTO.getGithubId());
        userRepository.save(user);
        log.debug("연동된 유저 {}", user.toString());

        oAuth2Status = OAuth2Status.GITHUB_LINK_SUCCESS;
        return user;
    }
}
