package com.collabit.portfolio.domain.dto;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@ToString
@Builder
public class GetMultipleHexagonProgressResponseDTO {
    private GetHexagonResponseDTO hexagon;
    private GetProgressResponseDTO progress;
}
