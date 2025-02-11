package com.collabit.project.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.util.List;

@AllArgsConstructor
@Getter
@Builder
@ToString
public class GetHexagonResponseDTO {
    int minScore;
    int maxScore;
    SkillData sympathy;
    SkillData listening;
    SkillData expression;
    SkillData problemSolving;
    SkillData conflictResolution;
    SkillData leadership;
}
