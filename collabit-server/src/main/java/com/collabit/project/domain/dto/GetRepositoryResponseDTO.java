package com.collabit.project.domain.dto;

import lombok.*;

import java.sql.Timestamp;
import java.util.List;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GetRepositoryResponseDTO {
    private String organization;
    private String title;
    private List<String> contributorsProfile;
    private Timestamp timestamp;
}