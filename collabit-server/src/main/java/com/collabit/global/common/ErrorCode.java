package com.collabit.global.common;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    // =========== Common ===========
    // 400 Bad Request (잘못된 형식)
    INVALID_TYPE_VALUE(HttpStatus.BAD_REQUEST, "올바르지 않은 타입입니다"),
    MISSING_REQUIRED_FIELD(HttpStatus.BAD_REQUEST, "필수 입력값이 누락되었습니다."),
    METHOD_ARGUMENT_NOT_VALID(HttpStatus.BAD_REQUEST, "요청 데이터가 형식이 올바르지 않습니다."),

    // 401 Unauthorized (인증 실패)
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "이메일 또는 비밀번호가 일치하지 않습니다."),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED,"로그인이 필요합니다."),

    // 403 Forbidden (인가 실패)
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "접근 권한이 없습니다."),

    // 404 Not Found
    DATA_NOT_FOUND(HttpStatus.NOT_FOUND, "데이터를 찾을 수 없습니다."),

    // 500 Internal Server Error (예상하지 못한 예외)
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다."),

    // =========== Auth ===========
    // 400 Bad Request (잘못된 형식)
    INVALID_VERIFICATION_CODE(HttpStatus.BAD_REQUEST, "인증코드가 틀립니다."),

    // 401 Unauthorized (인증 실패)
    REFRESH_TOKEN_NOT_FOUND(HttpStatus.UNAUTHORIZED, "Refresh Token이 존재하지 않습니다."),
    REFRESH_TOKEN_BLACKLISTED(HttpStatus.FORBIDDEN, "블랙리스트 Refresh Token 발견. 재발급 불가" ),
    INVALID_REFRESH_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않은 Refresh Token 입니다."),

    // 409 Conflict (중복)
    EMAIL_ALREADY_EXISTS(HttpStatus.CONFLICT, "이미 등록된 이메일입니다."),
    NICKNAME_ALREADY_EXISTS(HttpStatus.CONFLICT, "이미 등록된 닉네임입니다."),

    // =========== portfolio ===========
    SURVEY_NOT_CLOSED(HttpStatus.BAD_REQUEST, "설문이 마감되지 않아 프로젝트 결과를 조회할 수 없습니다."),
    PROJECT_INFO_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 프로젝트 정보를 찾을 수 없습니다."),
    FEEDBACK_NOT_FOUND(HttpStatus.NOT_FOUND, "해당되는 피드백 정보를 찾을 수 없습니다."),
    FAILED_DECODE_NICKNAME(HttpStatus.BAD_REQUEST, "닉네임 정보를 알 수 없습니다.");

    // =========== Business ===========

    private final HttpStatus status;
    private final String message;
}
