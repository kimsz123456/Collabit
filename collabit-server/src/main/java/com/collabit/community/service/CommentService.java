package com.collabit.community.service;

import com.collabit.community.domain.dto.Author;
import com.collabit.community.domain.dto.CreateCommentRequestDTO;
import com.collabit.community.domain.dto.CreateCommentResponseDTO;
import com.collabit.community.domain.dto.GetCommentResponseDTO;
import com.collabit.community.domain.dto.UpdateCommentRequestDTO;
import com.collabit.community.domain.entity.Comment;
import com.collabit.community.domain.entity.Post;
import com.collabit.community.exception.CommentNotFoundException;
import com.collabit.community.exception.ParentCommentNotFoundException;
import com.collabit.community.exception.PostNotFoundException;
import com.collabit.community.repository.CommentRepository;
import com.collabit.community.repository.PostRepository;
import com.collabit.user.domain.entity.User;
import com.collabit.user.exception.UserDifferentException;
import com.collabit.user.exception.UserNotFoundException;
import com.collabit.user.repository.UserRepository;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public CreateCommentResponseDTO createComment(CreateCommentRequestDTO requestDTO,
        int postCode, String userCode) {

        Comment comment = buildComment(requestDTO, postCode, userCode);
        Comment savedComment = commentRepository.save(comment);

        log.debug("Comment created with code: {} for post: {}", savedComment.getCode(), postCode);

        CreateCommentResponseDTO responseDTO = CreateCommentResponseDTO.builder()
            .code(savedComment.getCode())
            .build();
        return responseDTO;
    }

    public List<GetCommentResponseDTO> getCommentList(int postCode) {
        List<Comment> commentList = commentRepository.findByPostCode(postCode);
        log.debug("Found {} comments for post: {}", commentList.size(), postCode);

        // 부모 댓글만 먼저 추가
        Map<Integer, GetCommentResponseDTO> commentMap = new HashMap<>();
        List<GetCommentResponseDTO> rootComments = new ArrayList<>();

        // 1단계: 모든 댓글을 DTO로 변환하고 맵에 저장
        for (Comment comment : commentList) {

            GetCommentResponseDTO dto = buildDTO(comment);
            commentMap.put(dto.getCode(), dto);

            if (dto.getParentCommentCode() == null) {
                // 부모 댓글인 경우 루트 리스트에 추가
                rootComments.add(dto);
            }
        }

        // 2단계: 대댓글들을 부모 댓글의 replies에 추가
        for (GetCommentResponseDTO dto : commentMap.values()) {
            if (dto.getParentCommentCode() != null) {
                GetCommentResponseDTO parentDTO = commentMap.get(dto.getParentCommentCode());
                if (parentDTO != null) {
                    parentDTO.getReplies().add(dto);
                }
            }
        }

        // 각 댓글의 replies를 시간순으로 정렬
        for (GetCommentResponseDTO dto : commentMap.values()) {
            dto.getReplies().sort(Comparator.comparing(GetCommentResponseDTO::getCreatedAt));
        }

        // 루트 댓글들을 시간순으로 정렬
        rootComments.sort(Comparator.comparing(GetCommentResponseDTO::getCreatedAt));

        return rootComments;
    }

    public GetCommentResponseDTO updateComment(String userCode, int commentCode,
        UpdateCommentRequestDTO requestDTO) {

        Comment comment = commentRepository.findByCode(commentCode)
            .orElseThrow(() -> {
                log.debug("Comment with code {} not found", commentCode);
                return new CommentNotFoundException();
            });

        if (!comment.getUser().getCode().equals(userCode)) {
            log.debug("User {} attempted to update comment {} owned by {}",
                userCode, commentCode, comment.getUser().getCode());
            throw new UserDifferentException();
        }

        comment.setContent(requestDTO.getContent());
        Comment updatedComment = commentRepository.save(comment);

        log.debug("Comment {} successfully updated", commentCode);

        GetCommentResponseDTO responseDTO = buildDTO(updatedComment);
        return responseDTO;
    }

    public void deleteComment(String userCode, int commentCode) {

        Comment comment = commentRepository.findByCode(commentCode)
            .orElseThrow(() -> {
                log.debug("Comment with code {} not found", commentCode);
                return new CommentNotFoundException();
            });

        if (!comment.getUser().getCode().equals(userCode)) {
            log.debug("User {} attempted to delete comment {} owned by {}",
                userCode, commentCode, comment.getUser().getCode());
            throw new UserDifferentException();
        }

        comment.setDeleted(true);
        commentRepository.save(comment);

        log.debug("Comment {} marked as deleted", commentCode);
    }

    public Comment buildComment(CreateCommentRequestDTO requestDTO, int postCode, String userCode) {

        User user = userRepository.findByCode(userCode)
            .orElseThrow(() -> {
                log.debug("User with code {} not found", userCode);
                return new UserNotFoundException();
            });
        Post post = postRepository.findByCode(postCode)
            .orElseThrow(() -> {
                log.debug("Post with code {} not found", postCode);
                return new PostNotFoundException();
            });

        Comment comment = Comment.builder()
            .content(requestDTO.getContent())
            .post(post)
            .user(user)
            .build();

        if (requestDTO.getParentCommentCode() != null) {
            Comment parentComment = commentRepository.findByCode(requestDTO.getParentCommentCode())
                .orElseThrow(() -> {
                    log.debug("Parent comment with code {} not found",
                        requestDTO.getParentCommentCode());
                    return new ParentCommentNotFoundException();
                });
            comment.setParentComment(parentComment);
        }

        log.debug("Comment entity built successfully for post: {}", postCode);
        return comment;
    }

    public GetCommentResponseDTO buildDTO(Comment comment) {
        log.debug("Building DTO for comment: {}", comment.getCode());
        User author = comment.getUser();

        GetCommentResponseDTO responseDTO = GetCommentResponseDTO.builder()
            .code(comment.getCode())
            .postCode(comment.getPost().getCode())
            .author(Author.builder()
                .nickname(author.getNickname())
                .profileImage(author.getProfileImage())
                .githubId(author.getGithubId())
                .build())
            .content(comment.getContent())
            .createdAt(comment.getCreatedAt())
            .updatedAt(comment.getUpdatedAt())
            .isDeleted(comment.isDeleted())
            .build();

        if (comment.getParentComment() != null) {
            responseDTO.setParentCommentCode(comment.getParentComment().getCode());
        }

        return responseDTO;
    }
}