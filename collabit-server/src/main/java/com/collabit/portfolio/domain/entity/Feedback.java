package com.collabit.portfolio.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor
@Getter
@Builder
@AllArgsConstructor
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    // 영어이름
    @Column(nullable = false, length = 255)
    private String code;

    // 한글이름
    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "is_positive", nullable = false)
    private Boolean isPositive;

    @Column(nullable = false, length = 1000)
    private String feedback;

    // 다른 도메인에서 get하기 위해 생성
    public boolean isPositive() {
        return isPositive;
    }
}
