package com.collabit.portfolio.repository;

import com.collabit.portfolio.domain.entity.Portfolio;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, String> {
    Optional<Portfolio> findByUserCode(String userCode);
}
