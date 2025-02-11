package com.collabit.project.repository;

import com.collabit.project.domain.entity.TotalScore;
import jakarta.persistence.Table;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Table(name = "total_score")
@Repository
public interface TotalScoreRepository extends JpaRepository<TotalScore, Integer> {

}
