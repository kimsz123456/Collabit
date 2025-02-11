package com.collabit.chat.domain.entity;

import com.collabit.user.domain.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table
public class ChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int code;

    @Column(nullable = false, unique = true)
    private String uniqueCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userCode1", referencedColumnName = "code", nullable = false)
    private User user1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userCode2", referencedColumnName = "code", nullable = false)
    private User user2;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // 중복 방지 코드 생성 로직
    public static String generateChatRoomCode(String userCode1, String userCode2) {
        if (userCode1.compareTo(userCode2) < 0) {
            return userCode1 + "-" + userCode2;
        } else {
            return userCode2 + "-" + userCode1;
        }
    }

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();  // 채팅방 생성 시점 설정
        this.updatedAt = this.createdAt;  // 생성 시간과 마지막 업데이트 시간을 동일하게 설정
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();  // 메시지가 추가될 때마다 업데이트 시간 갱신
    }
}
