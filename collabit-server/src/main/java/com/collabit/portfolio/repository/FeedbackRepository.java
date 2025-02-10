package com.collabit.portfolio.repository;

import com.collabit.portfolio.domain.entity.Feedback;
import java.util.List;

import com.collabit.portfolio.repository.projection.FeedbackProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {

    public FeedbackProjection findByCodeAndIsPositive(String code, boolean isPositive);

}
