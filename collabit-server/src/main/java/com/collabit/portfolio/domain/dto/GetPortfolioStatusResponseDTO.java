package com.collabit.portfolio.domain.dto;

import lombok.*;

@Builder
@Getter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class GetPortfolioStatusResponseDTO {
    private boolean isUpdate; // 갱신 가능 여부
    private boolean isExist; // 포트폴리오 존재 여부
    private int totalParticipant; // 포트폴리오에 참여한 총 참여자 수
    private int totalProject; //프로젝트 수
}
