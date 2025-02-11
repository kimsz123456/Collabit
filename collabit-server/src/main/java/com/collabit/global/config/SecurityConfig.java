package com.collabit.global.config;

import com.collabit.auth.service.AuthService;
import com.collabit.global.security.JwtAccessDeniedHandler;
import com.collabit.global.security.JwtAuthenticationEntryPoint;
import com.collabit.global.security.JwtFilter;
import com.collabit.global.security.TokenProvider;
import com.collabit.oauth.handler.OAuth2SuccessHandler;
import com.collabit.oauth.service.CustomOAuth2UserService;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.socket.EnableWebSocketSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.filter.CorsFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final CorsFilter corsFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAccessDeniedHandler jwtAccessDeniedHandler;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    private final JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable) // csrf 비활성화 (JWT, OAUTH 사용할거라 필요 없음)
            .authorizeHttpRequests(auth -> {
                auth.requestMatchers("/api/user/sign-up","/api/user/login", "/api/auth/**", "/error", "/api/user/**", "/api/survey/**").permitAll();
                auth.requestMatchers("/api/oauth").anonymous(); // oauth 회원가입, 로그인의 경우 토큰이 있는 사용자 거부
                auth.requestMatchers("/api/oauth/**").permitAll();
                auth.requestMatchers("/oauth2/authorization/**").permitAll();
                auth.requestMatchers("/login/oauth2/code/**").permitAll();
                auth.requestMatchers("/api/post/**").permitAll();
                auth.requestMatchers("/v3/api-docs/**","/swagger-ui/**","/swagger-ui.html").permitAll();
                auth.anyRequest().authenticated();
            })
            .addFilterBefore(corsFilter, UsernamePasswordAuthenticationFilter.class) // cors필터 추가
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class) // jwt검증 필터 추가

            // exception handling 할 때 우리가 만든 클래스 추가
            .exceptionHandling((exceptionHandling) ->
                    exceptionHandling
                            .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                            .accessDeniedHandler(jwtAccessDeniedHandler)
            )

            // JWT는 세션 기반x -> stateless 방식으로 작동 -> 필요 없는 세션 비활성화
            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS) // JWT 사용 시 세션 비활성화
            )

            // Spring Security에서 OAuth2 로그인 기능을 활성화
            .oauth2Login(oauth2 ->  oauth2
                    .userInfoEndpoint(userInfo -> userInfo // 로그인 성공 후 사용자 정보를 가져오는 엔드포인트 설정
                            .userService(customOAuth2UserService) // 사용자 정보 처리할 서비스 설정
                    )
                    .successHandler(oAuth2SuccessHandler)
                    .failureHandler((request, response, exception) -> {
                        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                        response.setContentType("application/json;charset=UTF-8");
                        response.getWriter().write("OAuth 로그인 실패: " + exception.getMessage());
                    })
            );

        return http.build();
    }

    // 비밀번호 암호화 encoder
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @PostConstruct
    public void enableAuthenticationContextOnSpawnedThreads() {
        SecurityContextHolder.setStrategyName(SecurityContextHolder.MODE_INHERITABLETHREADLOCAL);
    }
}
