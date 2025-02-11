package com.collabit.survey.exception;

public class SurveyAuthorizationException extends RuntimeException {
    public SurveyAuthorizationException() {
        super("설문조사 권한이 없습니다.");
    }
}