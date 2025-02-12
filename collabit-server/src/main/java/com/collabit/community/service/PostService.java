package com.collabit.community.service;

import com.collabit.community.domain.dto.Author;
import com.collabit.community.exception.ImageCountExceededException;
import com.collabit.community.exception.PostNotFoundException;
import com.collabit.community.repository.CommentRepository;
import com.collabit.global.common.ErrorCode;
import com.collabit.global.common.PageResponseDTO;
import com.collabit.global.error.exception.BusinessException;
import com.collabit.global.service.S3Service;
import com.collabit.community.domain.dto.CreatePostRequestDTO;
import com.collabit.community.domain.dto.CreatePostResponseDTO;
import com.collabit.community.domain.dto.GetPostResponseDTO;
import com.collabit.community.domain.dto.UpdatePostRequestDTO;
import com.collabit.community.domain.entity.Image;
import com.collabit.community.domain.entity.Post;
import com.collabit.community.repository.ImageRepository;
import com.collabit.community.repository.PostRepository;
import com.collabit.user.domain.entity.User;
import com.collabit.user.exception.UserDifferentException;
import com.collabit.user.exception.UserNotFoundException;
import com.collabit.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PostService {

    private final S3Service s3Service;
    private final PostRepository postRepository;
    private final ImageRepository imageRepository;
    private final UserRepository userRepository;
    private final LikeCacheService likeCacheService;

    private static final String DIR_NAME = "posts";
    private final CommentRepository commentRepository;

    @Transactional
    public CreatePostResponseDTO createPost(String userCode, CreatePostRequestDTO requestDTO) {

        User user = userRepository.findByCode(userCode)
            .orElseThrow(() -> {
                    log.debug("User not found for user code {}", userCode);
                    return new BusinessException(ErrorCode.UNAUTHORIZED);
                }
            );

        Post post = Post.builder()
            .user(user)
            .content(requestDTO.getContent())
            .build();
        Post savedPost = postRepository.save(post);
        log.debug("Post created with code: {}", savedPost.getCode());

        if (requestDTO.getImages() != null) {
            if (requestDTO.getImages().length > 4) {
                throw new ImageCountExceededException();
            }
            Arrays.stream(requestDTO.getImages())
                .map(file -> {
                    String url = s3Service.upload(file, DIR_NAME);
                    log.debug("Image uploaded to S3: {}", url);
                    return Image.builder()
                        .url(url)
                        .post(savedPost)
                        .build();
                })
                .forEach(imageRepository::save);
        }

        CreatePostResponseDTO responseDTO = CreatePostResponseDTO.builder()
            .code(savedPost.getCode()).build();
        return responseDTO;
    }

    public PageResponseDTO<GetPostResponseDTO> getPostList(String userCode, int pageNumber) {
        int size = 20;
        Pageable pageable = PageRequest.of(pageNumber, size, Sort.by(Sort.Order.desc("updatedAt")));

        Page<Post> postPage = postRepository.findAll(pageable);
        log.debug("Found {} posts, page {} of {}",
            postPage.getTotalElements(),
            pageNumber + 1,
            postPage.getTotalPages());

        List<GetPostResponseDTO> content = postPage.getContent().stream()
            .map(post -> buildDTO(post, userCode))
            .collect(Collectors.toList());

        return PageResponseDTO.<GetPostResponseDTO>builder()
            .content(content)
            .pageNumber(postPage.getNumber())
            .pageSize(size)
            .totalElements((int) postPage.getTotalElements())
            .totalPages(postPage.getTotalPages())
            .last(postPage.isLast())
            .hasNext(postPage.hasNext())
            .build();
    }

    public GetPostResponseDTO getPost(String userCode, int postCode) {
        Post post = postRepository.findByCode(postCode)
            .orElseThrow(() -> {
                    log.debug("could not find post with code: {}", postCode);
                    return new PostNotFoundException();
                }
            );
        GetPostResponseDTO responseDTO = buildDTO(post, userCode);
        return responseDTO;
    }

    @Transactional
    public GetPostResponseDTO updatePost(String userCode, int postCode,
        UpdatePostRequestDTO requestDTO) {

        User user = userRepository.findByCode(userCode)
            .orElseThrow(() -> {
                    log.debug("User not found for user code {}", userCode);
                    return new BusinessException(ErrorCode.UNAUTHORIZED);
                }
            );

        Post post = postRepository.findByCode(postCode)
            .orElseThrow(() -> {
                log.debug("could not find post with code: {}", postCode);
                return new PostNotFoundException();
            });

        if (!post.getUser().getCode().equals(userCode)) {
            log.debug("User {} attempted to update post {} owned by {}",
                userCode, postCode, post.getUser().getCode());
            throw new UserDifferentException();
        }

        post.setContent(requestDTO.getContent());
        String[] imageUrls = requestDTO.getImages();
        List<Image> postImages = post.getImages();

        if (imageUrls != null) {
            postImages.removeIf(image -> {
                boolean shouldRemove = Arrays.asList(imageUrls).contains(image.getUrl());
                if (shouldRemove) {
                    log.debug("Deleting image from S3: {}", image.getUrl());
                    s3Service.delete(image.getUrl());
                }
                return shouldRemove;
            });
        }

        Post updatedPost = postRepository.save(post);
        log.debug("Post {} successfully updated", postCode);

        GetPostResponseDTO responseDTO = buildDTO(updatedPost, userCode);
        return responseDTO;
    }

    @Transactional
    public void deletePost(String userCode, int postCode) {

        User user = userRepository.findByCode(userCode)
            .orElseThrow(() -> {
                    log.debug("User not found for user code {}", userCode);
                    return new BusinessException(ErrorCode.UNAUTHORIZED);
                }
            );

        Post post = postRepository.findByCode(postCode)
            .orElseThrow(() -> new PostNotFoundException());

        if (!post.getUser().getCode().equals(userCode)) {
            log.debug("User {} attempted to delete post {} owned by {}",
                userCode, postCode, post.getUser().getCode());
            throw new UserDifferentException();
        }

        List<Image> images = post.getImages();
        log.debug("Removing {} images from S3", images.size());

        String[] imageUrls = images.stream()
            .map(Image::getUrl)
            .toArray(String[]::new);
        for (String url : imageUrls) {
            log.debug("Deleting image from S3: {}", url);
            s3Service.delete(url);
        }

        postRepository.deleteByCode(postCode);
        log.debug("Post {} successfully deleted", postCode);
    }

    public GetPostResponseDTO buildDTO(Post post, String userCode) {
        log.debug("Building DTO for post: {}", post.getCode());
        System.out.println("유저코드"+userCode);
        if (userCode != "anonymousUser") {
            userRepository.findByCode(userCode).orElseThrow(() -> {
                log.debug("could not find user with code {}", userCode);
                return new UserNotFoundException();
            });
        }

        List<Image> images = post.getImages();
        List<String> imageUrls = images.stream()
            .map(Image::getUrl)
            .collect(Collectors.toList());

        int likeCount = likeCacheService.getLikeCount((post.getCode()));
        boolean isLiked = userCode != null ? likeCacheService.getIsLiked(userCode, post.getCode()) : false;

        User author = post.getUser();

        return GetPostResponseDTO.builder()
            .code(post.getCode())
            .author(Author.builder()
                .nickname(author.getNickname())
                .profileImage(author.getProfileImage())
                .githubId(author.getGithubId())
                .build())
            .content(post.getContent())
            .commentCount(commentRepository.findByPostCode(post.getCode()).size())
            .createdAt(post.getCreatedAt())
            .updatedAt(post.getUpdatedAt())
            .images(imageUrls)
            .likeCount(likeCount)
            .liked(isLiked)
            .build();
    }


    public List<GetPostResponseDTO> recommendPost(String userCode) {
        log.debug("Finding recommended posts");

        Pageable pageable = PageRequest.of(0, 5);
        Page<Post> topPosts = postRepository.findTop5ByOrderByLikeCountAndCreatedAt(pageable);

        return topPosts.getContent().stream()
            .map(post -> buildDTO(post, userCode))
            .collect(Collectors.toList());
    }

    public List<GetPostResponseDTO> latestPost(String userCode) {
        log.debug("Finding latest posts");

        Pageable pageable = PageRequest.of(0, 5);
        Page<Post> latestPosts = postRepository.findAll(pageable);

        return latestPosts.getContent().stream()
            .map(post -> buildDTO(post, userCode))
            .collect(Collectors.toList());
    }


}