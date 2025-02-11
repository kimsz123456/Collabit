package com.collabit.portfolio.domain.dto;

import lombok.*;

@Getter
@Builder
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class GetPortfolioInfoResponseDTO {
    private String nickname;
    private int participant;
    private int project;
}
