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
    private Long sympathy=0L;

    @Column(nullable = false, columnDefinition = "BIGINT DEFAULT 0")
    private Long listening=0L;

    @Column(nullable = false, columnDefinition = "BIGINT DEFAULT 0")
    private Long expression=0L;

    @Column(name = "problem_solving", nullable = false, columnDefinition = "BIGINT DEFAULT 0")
    private Long problemSolving=0L;

    @Column(name = "conflict_resolution", nullable = false, columnDefinition = "BIGINT DEFAULT 0")
    private Long conflictResolution=0L;

    @Column(nullable = false, columnDefinition = "BIGINT DEFAULT 0")
    private Long leadership=0L;

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

    public void updatePortfolio(
        int project,
        int participant,
        long sympathy,
        long listening,
        long conflictResolution,
        long expression,
        long problemSolving,
        long leadership,
        boolean isUpdate,
        LocalDateTime updatedAt
    ) {
        this.project = project;
        this.participant = participant;
        this.sympathy += sympathy;
        this.listening += listening;
        this.conflictResolution += conflictResolution;
        this.expression += expression;
        this.problemSolving += problemSolving;
        this.leadership += leadership;
        this.isUpdate = isUpdate;
        this.updatedAt = updatedAt;
    }
}