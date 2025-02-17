package com.collabit.community.controller;

import com.collabit.community.domain.dto.LikeResponseDTO;
import com.collabit.community.service.LikeService;
import com.collabit.global.security.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "LikeController", description = "게시글 좋아요 API")
@RestController
@RequestMapping("/api/post/{postCode}/like")
@RequiredArgsConstructor
@Slf4j
public class LikeController {

    private final LikeService likeService;

    @Operation(summary="게시글 좋아요",description = "게시글 좋아요 요청 API입니다.")
    @PostMapping
    public ResponseEntity<?> likePost(@PathVariable("postCode")int postCode){
        String userCode = SecurityUtil.getCurrentUserCode();
        LikeResponseDTO responseDTO = likeService.like(userCode, postCode);
        log.debug("PostLike responseDTO: {}", responseDTO.toString());
        return ResponseEntity.status(201).body(responseDTO);
    }

    @Operation(summary="게시글 좋아요 취소",description = "게시글 좋아요 취소 API입니다.")
    @DeleteMapping
    public ResponseEntity<?> cancelLikePost(@PathVariable("postCode")int postCode){
        String userCode = SecurityUtil.getCurrentUserCode();
        LikeResponseDTO responseDTO = likeService.cancelLike(userCode, postCode);
        log.debug("DeleteLike responseDTO: {}", responseDTO.toString());
        return ResponseEntity.status(201).body(responseDTO);
    }
}
