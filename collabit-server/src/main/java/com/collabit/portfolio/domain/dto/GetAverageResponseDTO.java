package com.collabit.portfolio.domain.dto;

import com.collabit.project.domain.dto.SkillData;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GetAverageResponseDTO {
    private ScoreData sympathy;
    private ScoreData listening;
    private ScoreData expression;
    private ScoreData problemSolving;
    private ScoreData conflictResolution;
    private ScoreData leadership;
    private int minScore;
    private int maxScore;
}