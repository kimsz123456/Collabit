package com.collabit.portfolio.repository;

import com.collabit.portfolio.domain.entity.Description;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface DescriptionRepository extends JpaRepository<Description, String> {

}
