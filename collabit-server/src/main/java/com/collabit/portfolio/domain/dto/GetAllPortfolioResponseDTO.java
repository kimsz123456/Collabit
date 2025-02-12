package com.collabit.portfolio.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;


@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GetAllPortfolioResponseDTO {
    GetPortfolioInfoResponseDTO portfolioInfo;
    GetHexagonResponseDTO hexagon;
    GetProgressResponseDTO progress;
    WordCloudData wordCloud;
    AISummaryData aiSummary;
    GetTimelineResponseDTO timeline;
}
