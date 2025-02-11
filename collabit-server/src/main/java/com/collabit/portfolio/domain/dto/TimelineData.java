package com.collabit.portfolio.domain.dto;

import lombok.*;

import java.time.LocalDateTime;

@AllArgsConstructor
@Builder
@ToString
@NoArgsConstructor
@Getter
public class TimelineData {
    private String projectName;
    private String organization;
    private LocalDateTime completedAt;
    private ScoreData sympathy;
    private ScoreData listening;
    private ScoreData expression;
    private ScoreData problemSolving;
    private ScoreData conflictResolution;
    private ScoreData leadership;
}
