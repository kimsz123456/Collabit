package com.collabit.auth.service;

import com.collabit.global.service.RedisService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import java.util.Random;
import java.util.concurrent.TimeUnit;

// 이메일 인증코드 생성, 전송
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    private final JavaMailSender javaMailSender;
    private final RedisService redisService;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final long EXPIRE_MINUTES = 5; // 인증 코드 유효 시간: 5분
    private static final String EMAIL_SUBJECT = "[Collabit] 회원가입 인증 코드";


    // 이메일 전송 메서드
    public void sendMail(String email){
        int verificationCode = generateVerificationCode();
        setCode(email, verificationCode);

        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

            helper.setTo(email); // 수신자 이메일 주소
            helper.setSubject(EMAIL_SUBJECT); // 이메일 제목
            helper.setText("Collabit 회원가입인증 코드: " + verificationCode); // 이메일 본문

            javaMailSender.send(message);
            log.debug("이메일 전송 성공: {}", email);
        } catch (MessagingException e){
            log.debug("이메일 전송 실패: {}", e.getMessage());
            throw new RuntimeException("이메일 전송 중 오류 발생");
        }
    }

    // 인증 코드 검증
    public String verifyCode(String email, int code) {
        Object storedCode = redisService.get(email);
        if (storedCode == null) {
            return "만료";
        }

        Integer IntStoredCode = (Integer) storedCode;
        if (IntStoredCode.equals(code)) {
            // 인증 성공 시 Redis 에서 삭제
            redisService.delete(email);

            // 인증 완료 저장
            redisTemplate.opsForValue().set("verifiedEmailCode:" + email, true, 600, TimeUnit.SECONDS);
            return "성공";
        } else {
            return "틀림";
        }
    }

    // 랜덤 6자리 인증 코드 생성 메서드
    private int generateVerificationCode() {
        return new Random().nextInt(900000) + 100000;
    }

    // email : code redis 저장 메서드(5분)
    private void setCode(String email,int code){
        redisTemplate.opsForValue().set(email,code,300, TimeUnit.SECONDS);;

    }

}
