package com.collabit.community.repository;

import com.collabit.community.domain.entity.Post;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRepository extends JpaRepository<Post, Integer> {

    Optional<Post> findByCode(int postCode);

    void deleteByCode(int postCode);

    @Query("SELECT p FROM Post p " +
        "LEFT JOIN PostLike pl ON p.code = pl.id.postCode " +
        "GROUP BY p " +
        "ORDER BY COUNT(pl) DESC, p.createdAt DESC")
    Page<Post> findTop5ByOrderByLikeCountAndCreatedAt(Pageable pageable);

    @Query("SELECT p FROM Post p ORDER BY p.createdAt DESC")
    Page<Post> findAll(Pageable pageable);

    Page<Post> findByUserCode(String userCode, Pageable pageable);
}
