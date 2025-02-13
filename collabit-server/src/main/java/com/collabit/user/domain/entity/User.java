package com.collabit.user.domain.entity;

import jakarta.persistence.*;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.GrantedAuthority;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@Builder
@ToString
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "code")
    private String code;

    @Column(name = "email", unique = true)
    private String email;

    @Column(name = "github_id", unique = true)
    private String githubId;

    @Column(name = "password")
    private String password;

    @Column(name = "nickname", length = 20, nullable = false, unique = true)
    private String nickname;

    @Column(name = "profile_image", nullable = false)
    private String profileImage;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING) // Role을 문자열로 저장
    @Column(name = "role", nullable = false)
    private Role role;

    // 일반회원에 GitHub 연동을 위한 메소드
    public void linkGithub(String githubId) {
        this.githubId = githubId;
    }
    
    // 프로필 이미지 업데이트 메소드
    public void updateProfileImage(String newImage) {
        this.profileImage = newImage;
    }

    // 권한 정보를 반환하는 메소드
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(role); // 단일 권한일 경우
    }

    // 비밀번호 업데이트 메소드
    public void updatePassword(String encodedNewPassword) {
        this.password = encodedNewPassword;
    }

    // 닉네임 업데이트 메소드
    public void updateNickname(String newNickname) {
        this.nickname = newNickname;
    }

    // 회원탈퇴 메서드
    public void resetFields() {
        this.email = "탈퇴";
        this.githubId = "탈퇴";
        this.password = "탈퇴";
        this.profileImage = "탈퇴";
        this.nickname = "(탈퇴한 회원)";
    }
}