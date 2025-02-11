package com.collabit.portfolio.domain.dto;

import lombok.*;

@AllArgsConstructor
@Builder
@NoArgsConstructor
@Getter
public class SkillData {
    private String name;
    private double score;
    private String feedback;
    private String description;
    private boolean isPositive;
}
