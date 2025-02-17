package com.collabit.portfolio.domain.entity;

import com.collabit.portfolio.domain.dto.WordCloudItem;
import jakarta.persistence.Id;
import lombok.*;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

@Document(collection = "wordcloud_collection")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WordCloud {

    @Id
    private String id;

    @Field("user_code")
    private String userCode;

    private List<WordCloudItem> strength;

    private List<WordCloudItem> weakness;
}
