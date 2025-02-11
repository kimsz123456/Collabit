package com.collabit.project.exception;

public class DescriptionNotFoundException extends RuntimeException {
    public DescriptionNotFoundException() {super("해당하는 description이 없습니다.");}
}
