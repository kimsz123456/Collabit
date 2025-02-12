package com.collabit.portfolio.domain.dto;

import lombok.*;

@ToString
@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class AISummaryData {
    String strength;
    String weakness;
}
