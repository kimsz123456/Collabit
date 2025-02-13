package com.collabit.portfolio.domain.dto;

import lombok.*;

import java.util.List;

@ToString
@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class WordCloudData {
    List<WordCloudItem> strength;
    List<WordCloudItem> weakness;
}
