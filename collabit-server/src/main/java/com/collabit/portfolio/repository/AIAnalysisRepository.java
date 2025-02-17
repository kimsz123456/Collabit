package com.collabit.portfolio.repository;

import com.collabit.portfolio.domain.entity.AIAnalysis;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AIAnalysisRepository extends MongoRepository<AIAnalysis, String> {
    AIAnalysis findByUserCode(String userCode);
}
