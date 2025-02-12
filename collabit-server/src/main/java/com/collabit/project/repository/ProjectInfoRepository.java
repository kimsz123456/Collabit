package com.collabit.project.repository;

import com.collabit.project.domain.entity.ProjectInfo;
import io.lettuce.core.dynamic.annotation.Param;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ProjectInfoRepository extends JpaRepository<ProjectInfo, Integer> {

    ProjectInfo findByCode(int code);

    ProjectInfo findByProjectCodeAndUserCode(int code, String userCode);

    @Query("SELECT DISTINCT pi FROM ProjectInfo pi " +
            "JOIN FETCH pi.project p " +
            "WHERE pi.user.code = :userCode")
    List<ProjectInfo> findByUserCodeWithProject(String userCode);

    List<ProjectInfo> findByUserCode(String userCode);

    List<ProjectInfo> findByProjectCodeOrderByCodeAsc(int code);

    @Transactional
    @Modifying
    @Query("UPDATE ProjectInfo p SET p.sympathy = p.sympathy + :sympathy, " +
            "p.listening = p.listening + :listening, " +
            "p.expression = p.expression + :expression, " +
            "p.problemSolving = p.problemSolving + :problemSolving, " +
            "p.conflictResolution = p.conflictResolution + :conflictResolution, " +
            "p.leadership = p.leadership + :leadership " +
            "WHERE p.code = :projectInfoCode")
    void updateSurveyScores(int projectInfoCode, int sympathy, int listening, int expression,
                            int problemSolving, int conflictResolution, int leadership);


    @Query("SELECT p FROM ProjectInfo p WHERE p.user.code = :userCode AND p.completedAt IS NOT NULL")
    List<ProjectInfo> findAllCompletedByUserCode(@Param("userCode") String userCode);

    @Query("SELECT p FROM ProjectInfo p WHERE p.completedAt IS NOT NULL")
    List<ProjectInfo> findAllCompleted();

    List<ProjectInfo> findTop8ByUserCodeAndCompletedAtIsNotNullOrderByCompletedAtDesc(String userCode);

    List<ProjectInfo> findByUser_CodeAndCompletedAtIsNotNull(String userCode);

    List<ProjectInfo> findAllByUserCodeAndCompletedAtAfter(String userCode, LocalDateTime completedAtAfter);

    List<ProjectInfo> findAllByProjectCode(int projectCode);
}
