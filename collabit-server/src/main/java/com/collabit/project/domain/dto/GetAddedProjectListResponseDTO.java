package com.collabit.project.domain.dto;

import com.collabit.project.domain.entity.ProjectInfo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
@AllArgsConstructor
public class GetAddedProjectListResponseDTO {
    private final int code;
    private final String organization;
    private final String title;
}
