package com.collabit.project.domain.entity;

import com.collabit.user.domain.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ProjectInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int code;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_code")
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_code")
    private User user;

    @Column(nullable = false)
    private int total;

    @Builder.Default
    @Column(nullable = false)
    private int participant = 0;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at", nullable = false, insertable = false)
    private LocalDateTime createdAt;

    @Builder.Default
    @Column(nullable = false)
    private int sympathy = 0;

    @Builder.Default
    @Column(nullable = false)
    private int listening = 0;

    @Builder.Default
    @Column(nullable = false)
    private int expression = 0;

    @Builder.Default
    @Column(name = "problem_solving", nullable = false)
    private int problemSolving = 0;

    @Builder.Default
    @Column(name = "conflict_resolution", nullable = false)
    private int conflictResolution = 0;

    @Builder.Default
    @Column(nullable = false)
    private int leadership = 0;

    @OneToMany(mappedBy = "projectInfo")
    private List<ProjectContributor> projectContributors;

    public void completeSurvey() {
        this.completedAt = LocalDateTime.now();
    }

    public void increaseParticipant(int amount) {
        this.participant += amount;
    }
}
