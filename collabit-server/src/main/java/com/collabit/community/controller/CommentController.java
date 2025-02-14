package com.collabit.community.controller;

import com.collabit.community.domain.dto.CreateCommentRequestDTO;
import com.collabit.community.domain.dto.CreateCommentResponseDTO;
import com.collabit.community.domain.dto.GetCommentResponseDTO;
import com.collabit.community.domain.dto.UpdateCommentRequestDTO;
import com.collabit.community.service.CommentService;
import com.collabit.global.security.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "CommentController", description = "댓글 API")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class CommentController {

    private final CommentService commentService;

    @Operation(summary="댓글 등록",description = "댓글을 등록하는 API입니다.")
    @PostMapping("/post/{postCode}/comment")
    public ResponseEntity<?> createComment(@PathVariable("postCode") int postCode,@RequestBody CreateCommentRequestDTO requestDTO) {
        log.debug("CreateComment requestDTO: {}", requestDTO.toString());
        String userCode = SecurityUtil.getCurrentUserCode();
        CreateCommentResponseDTO responseDTO = commentService.createComment(requestDTO,postCode,userCode);
        log.debug("CreateComment responseDTO: {}", responseDTO.toString());
        return ResponseEntity.status(201).body(responseDTO);
    }

    @Operation(summary="댓글 목록 조회",description = "댓글목록을 조회하는 API입니다.")
    @GetMapping("/post/{postCode}/comment")
    public ResponseEntity<List<GetCommentResponseDTO>> getCommentList(@PathVariable("postCode") int postCode) {
        List<GetCommentResponseDTO> list = commentService.getCommentList(postCode);
        log.debug("getComment List: {}", Objects.toString(list, "null"));
        if (list.isEmpty()) return ResponseEntity.status(204).build();
        return ResponseEntity.status(200).body(list);
    }

    @Operation(summary="댓글 수정",description = "댓글을 수정하는 API입니다.")
    @PutMapping("/comment/{commentCode}")
    public ResponseEntity<?> updateComment(@PathVariable("commentCode") int commentCode,@RequestBody UpdateCommentRequestDTO requestDTO) {
        String userCode = SecurityUtil.getCurrentUserCode();
        GetCommentResponseDTO responseDTO = commentService.updateComment(userCode,commentCode,requestDTO);
        log.debug("getComment responseDTO: {}", responseDTO.toString());
        return ResponseEntity.status(201).body(responseDTO);
    }

    @Operation(summary="댓글 삭제",description = "댓글을 삭제하는 API입니다.")
    @DeleteMapping("/comment/{commentCode}")
    public ResponseEntity<?> deleteComment(@PathVariable("commentCode") int commentCode){
        String userCode = SecurityUtil.getCurrentUserCode();
        commentService.deleteComment(userCode,commentCode);
        return ResponseEntity.status(204).build();
    }
}
