package com.collabit.survey.repository;

import com.collabit.survey.domain.entity.SurveyMultiple;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SurveyMultipleRepository extends MongoRepository<SurveyMultiple, String> {
    SurveyMultiple findByProjectInfoCodeAndUserCode(int projectInfoCode, String userCode);

    void deleteByProjectInfoCode(int projectInfoCode);
}
