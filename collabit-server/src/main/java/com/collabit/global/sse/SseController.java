package com.collabit.global.sse;

import com.collabit.chat.service.ChatRedisService;
import com.collabit.chat.service.ChatSseEmitterService;
import com.collabit.global.security.SecurityUtil;
import com.collabit.project.service.ProjectSseEmitterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RequestMapping("/api/sse")
@RequiredArgsConstructor
@RestController
public class SseController {

    private final SseEmitterService sseEmitterService;
    private final ProjectSseEmitterService projectSseEmitterService;
    private final ChatRedisService chatRedisService;

    // 클라이언트의 SSE 연결 요청을 처리하는 엔드포인트 (로그인 유저와 연결)
    @GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe() {
        String userCode = SecurityUtil.getCurrentUserCode();
        return sseEmitterService.subscribe(userCode);
    }

    @GetMapping("/notification")
    public ResponseEntity<?> notification() {
        String userCode = SecurityUtil.getCurrentUserCode();
        projectSseEmitterService.sendHeaderNotification(userCode);
        chatRedisService.sendChatNotification(userCode);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/survey")
    public ResponseEntity<?> deleteSurveyNotification() {
        String userCode = SecurityUtil.getCurrentUserCode();
        projectSseEmitterService.sendAfterDeleteSurveyReqeust(userCode);
        return ResponseEntity.ok().build();
    }
}
