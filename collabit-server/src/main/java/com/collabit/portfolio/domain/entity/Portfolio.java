package com.collabit.portfolio.domain.entity;

import com.collabit.user.domain.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import lombok.ToString;

@Getter
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class Portfolio {
    @Id
    @Column(name = "user_code")
    private String userCode;

    @Column(nullable = false)
    private int project;

    @Column(nullable = false)
    private int participant;

    @Column(nullable = false, columnDefinition = "BIGINT DEFAULT 0")
    private Long sympathy;

    @Column(nullable = false, columnDefinition = "BIGINT DEFAULT 0")
    private Long listening;

    @Column(nullable = false, columnDefinition = "BIGINT DEFAULT 0")
    private Long expression;

    @Column(name = "problem_solving", nullable = false, columnDefinition = "BIGINT DEFAULT 0")
    private Long problemSolving;

    @Column(name = "conflict_resolution", nullable = false, columnDefinition = "BIGINT DEFAULT 0")
    private Long conflictResolution;

    @Column(nullable = false, columnDefinition = "BIGINT DEFAULT 0")
    private Long leadership;

    @Column(name = "is_update", columnDefinition = "BOOLEAN DEFAULT false")
    private Boolean isUpdate;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_code")
    private User user;

    @Version
    private Long version;

    public void changeUpdateStatus(){
        this.isUpdate = true;
    }
}