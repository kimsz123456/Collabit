package com.collabit.portfolio.domain.dto;

import lombok.*;

@AllArgsConstructor
@Builder
@ToString
@NoArgsConstructor
@Getter
public class GetHexagonResponseDTO {
    private SkillData sympathy;
    private SkillData listening;
    private SkillData expression;
    private SkillData problemSolving;
    private SkillData conflictResolution;
    private SkillData leadership;

    private int minScore;
    private int maxScore;

}
