package com.collabit.project.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@AllArgsConstructor
@Builder
@Getter
public class SkillData {
    String name;
    Double score;
    String description;
    String feedback;
    boolean isPositive;
}
