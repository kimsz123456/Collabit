package com.collabit.portfolio.domain.dto;

import lombok.*;

@AllArgsConstructor
@Builder
@ToString
@NoArgsConstructor
@Getter
public class GetProgressResponseDTO {
    private ScoreData sympathy;
    private ScoreData listening;
    private ScoreData expression;
    private ScoreData problemSolving;
    private ScoreData conflictResolution;
    private ScoreData leadership;

    private int minScore;
    private int maxScore;
}