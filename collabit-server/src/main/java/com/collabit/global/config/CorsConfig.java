package com.collabit.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        // "URL 에 따라" CORS 설정을 다르게 적용할 수 있음
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true); // client request 에 자격증명(쿠키, 인증헤더)포함 허용 허용
        config.addAllowedOrigin("https://collabit.site");
        config.addAllowedOrigin("http://localhost:3000"); // Todo: 모든 도메인(출처)에서의 요청 허용(우리사이트로 수정 필요*******)
        config.addAllowedHeader("*"); // 모든 헤더 허용
        config.addAllowedMethod("*"); // 모든 메서드(GET, POST, PUT, DELETE 등) 허용

        // 해당 URL에 설정한 config를 등록
        source.registerCorsConfiguration("/api/**", config);

        return new CorsFilter(source);
    }
}
