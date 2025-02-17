package com.collabit.portfolio.repository;

import com.collabit.portfolio.domain.entity.WordCloud;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WordcloudCollectionRepository extends MongoRepository<WordCloud, String> {
    WordCloud findByUserCode(String userCode);
}
