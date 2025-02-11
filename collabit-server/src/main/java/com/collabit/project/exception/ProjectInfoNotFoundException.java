package com.collabit.project.exception;

public class ProjectInfoNotFoundException extends RuntimeException{
    public ProjectInfoNotFoundException() {super("해당 프로젝트 정보가 없습니다.");}
}
