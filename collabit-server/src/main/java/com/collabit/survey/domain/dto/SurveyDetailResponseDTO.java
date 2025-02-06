package com.collabit.survey.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Getter
@AllArgsConstructor
@Builder
@ToString
public class SurveyDetailResponseDTO {
    String nickname;
    String profileImage;
    String title;
    SurveyMultipleResponseDTO surveyMultipleResponse;
    SurveyEssayResponseDTO surveyEssayResponse;
}
