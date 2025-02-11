package com.collabit.global.common;

import lombok.*;

import java.util.List;

@Builder
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class PageResponseDTO<T> {
    List<T> content; //현재 페이지의 데이터 배열
    int pageNumber; //현재 페이지 번호 (0부터 시작)
    int pageSize; //페이지당 아이템 수
    int totalElements; //전체 데이터 개수
    int totalPages; //전체  페이지 수
    boolean last; //마지막 페이지 여부
    boolean hasNext; //다음 페이지 존재 여부
}
