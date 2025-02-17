package com.collabit.community.controller;

import com.collabit.community.domain.dto.CreatePostRequestDTO;
import com.collabit.community.domain.dto.CreatePostResponseDTO;
import com.collabit.community.domain.dto.GetPostResponseDTO;
import com.collabit.community.domain.dto.UpdatePostRequestDTO;
import com.collabit.community.service.PostService;
import com.collabit.global.common.PageResponseDTO;
import com.collabit.global.security.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tools.ant.taskdefs.Get;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "PostController", description = "게시판 API")
@RestController
@RequestMapping("/api/post")
@RequiredArgsConstructor
@Slf4j
public class PostController {

    private final PostService postService;

    @Operation(summary="게시글 등록",description = "게시글을 등록하는 API입니다.")
    @PostMapping
    public ResponseEntity<CreatePostResponseDTO> createPost(@ModelAttribute CreatePostRequestDTO requestDTO){
        log.debug("CreatePost requestDTO: {}", requestDTO.toString());
        String userCode = SecurityUtil.getCurrentUserCode();
        CreatePostResponseDTO responseDTO = postService.createPost(userCode, requestDTO);
        log.debug("CreatePost responseDTO: {}", responseDTO.toString());
        return ResponseEntity.status(201).body(responseDTO);
    }

    @Operation(summary="게시글 목록 조회",description = "게시글 목록을 조회하는 API입니다.")
    @GetMapping
    public ResponseEntity<PageResponseDTO<GetPostResponseDTO>> getPostList(@RequestParam("pageNumber") int pageNumber){
        String userCode = SecurityUtil.getCurrentUserCode();
        PageResponseDTO<GetPostResponseDTO> responseDTO = postService.getPostList(userCode,pageNumber);
        log.debug("getPost List: {}", Objects.toString(responseDTO, "null"));
        if (responseDTO.getContent().isEmpty()) return ResponseEntity.noContent().build();
        return ResponseEntity.status(200).body(responseDTO);
    }

    @Operation(summary="게시글 상세 조회",description = "게시글을 상세 조회하는 API입니다.")
    @GetMapping("/{postCode}")
    public ResponseEntity<GetPostResponseDTO> getPost(@PathVariable int postCode){
        String userCode = SecurityUtil.getCurrentUserCode();
        GetPostResponseDTO responseDTO = postService.getPost(userCode, postCode);
        log.debug("getPost responseDTO: {}", responseDTO.toString());
        return ResponseEntity.status(200).body(responseDTO);
    }

    @Operation(summary="게시글 수정",description = "게시글을 수정하는 API입니다.")
    @PutMapping("/{postCode}")
    public ResponseEntity<GetPostResponseDTO> updatePost(@PathVariable int postCode,@RequestBody UpdatePostRequestDTO requestDTO){
        log.debug("updatePost requestDTO: {}", requestDTO.toString());
        String userCode = SecurityUtil.getCurrentUserCode();
        GetPostResponseDTO responseDTO = postService.updatePost(userCode, postCode, requestDTO);
        log.debug("updatePost responseDTO: {}", responseDTO.toString());
        return ResponseEntity.status(201).body(responseDTO);
    }

    @Operation(summary="게시글 삭제",description = "게시글을 삭제하는 API입니다.")
    @DeleteMapping("/{postCode}")
    public ResponseEntity<?> deletePost(@PathVariable int postCode){
        String userCode = SecurityUtil.getCurrentUserCode();
        postService.deletePost(userCode, postCode);
        return ResponseEntity.status(204).build();
    }
    
    @Operation(summary="추천 게시글 조회",description = "추천 게시글을 조회하는 API입니다.")
    @GetMapping("/recommend")
    public ResponseEntity<List<GetPostResponseDTO>> recommendPost(){
        String userCode = SecurityUtil.getCurrentUserCode();
        List<GetPostResponseDTO> list = postService.recommendPost(userCode);
        if(list.isEmpty()) return ResponseEntity.noContent().build();
        return ResponseEntity.status(200).body(list);
    }

    @Operation(summary="최신 게시글 조회",description = "최신 게시글을 조회하는 API입니다.")
    @GetMapping("/latest")
    public ResponseEntity<List<GetPostResponseDTO>> latestPost(){
        String userCode = SecurityUtil.getCurrentUserCode();
        List<GetPostResponseDTO> list = postService.latestPost(userCode);
        if(list.isEmpty()) return ResponseEntity.noContent().build();
        return ResponseEntity.status(200).body(list);
    }

    @Operation(summary="내가 쓴 글 조회",description = "내가 쓴 게시글을 조회하는 API입니다.")
    @GetMapping("/myPost")
    public ResponseEntity<PageResponseDTO<GetPostResponseDTO>> myPost(@RequestParam("pageNumber") int pageNumber){
        String userCode = SecurityUtil.getCurrentUserCode();
        PageResponseDTO<GetPostResponseDTO> responseDTO = postService.myPost(userCode,pageNumber);
        if (responseDTO.getContent().isEmpty()) return ResponseEntity.noContent().build();
        return ResponseEntity.status(200).body(responseDTO);
    }
}