package com.collabit.global.sse;

import com.collabit.chat.service.ChatRedisService;
import com.collabit.chat.service.ChatSseEmitterService;
import com.collabit.global.security.SecurityUtil;
import com.collabit.project.service.ProjectSseEmitterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Tag(name = "SseController", description = "sse API")
@RequestMapping("/api/sse")
@RequiredArgsConstructor
@RestController
public class SseController {

    private final SseEmitterService sseEmitterService;
    private final ProjectSseEmitterService projectSseEmitterService;
    private final ChatRedisService chatRedisService;

    @Operation(summary = "SSE 연결 요청", description = "로그인 유저와 SSE 연결 요청을 처리하는 API입니다.")
    @GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe() {
        String userCode = SecurityUtil.getCurrentUserCode();
        return sseEmitterService.subscribe(userCode);
    }

    @Operation(summary = "헤더 알림 SSE 전송", description = "로그인 유저에게 있는 설문 요청/응답, 채팅 알림을 SSE로 전송하는 API입니다.")
    @GetMapping("/notification")
    public ResponseEntity<?> notification() {
        String userCode = SecurityUtil.getCurrentUserCode();
        projectSseEmitterService.sendHeaderNotification(userCode);
        chatRedisService.sendChatNotification(userCode);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "설문 요청 알림 제거", description = "로그인 유저에게 있는 설문 요청 알림을 제거하고 SSE로 전송하는 API입니다.")
    @DeleteMapping("/survey")
    public ResponseEntity<?> deleteSurveyNotification() {
        String userCode = SecurityUtil.getCurrentUserCode();
        projectSseEmitterService.sendAfterDeleteSurveyReqeust(userCode);
        return ResponseEntity.ok().build();
    }
}
