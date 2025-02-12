package com.collabit.portfolio.domain.dto;

import lombok.*;

@ToString
@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class WordCloudItem {
    String text;
    Double value;
}
