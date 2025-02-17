package com.collabit.portfolio.domain.entity;

import com.collabit.portfolio.domain.dto.AISummaryData;
import jakarta.persistence.Id;
import lombok.*;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "ai_analysis")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIAnalysis {

    @Id
    private String id;

    @Field("user_code")
    private String userCode;

    @Field("analysis_results")
    private AISummaryData analysisResults;

    @Field("created_at")
    private LocalDateTime createdAt;

}
