package com.collabit.global.config;

import com.collabit.auth.service.AuthService;
import com.collabit.global.security.CustomUserDetailsService;
import com.collabit.global.security.JwtAccessDeniedHandler;
import com.collabit.global.security.JwtAuthenticationEntryPoint;
import com.collabit.global.security.JwtFilter;
import com.collabit.global.security.SecurityUtil;
import com.collabit.global.security.TokenProvider;
import com.collabit.oauth.handler.OAuth2SuccessHandler;
import com.collabit.oauth.service.CustomOAuth2UserService;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
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
    private final CustomUserDetailsService customUserDetailsService;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    private final JwtFilter jwtFilter;
    private final TokenProvider tokenProvider;

    @Value("${oauth.frontend.redirect-url}")
    private String frontendRedirectUrl;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .authorizeHttpRequests(auth -> {
                auth.requestMatchers("/api/user/sign-up","/api/user/login", "/api/auth/**", "/error", "/api/user/**", "/api/survey/**").permitAll();
                auth.requestMatchers("/api/oauth").anonymous();
                auth.requestMatchers("/api/oauth/**").permitAll();
                auth.requestMatchers("/oauth2/authorization/**").permitAll();
                auth.requestMatchers("/login/oauth2/code/**").permitAll();
                auth.requestMatchers("/api/post/**").permitAll();
                auth.requestMatchers("/v3/api-docs/**","/swagger-ui/**","/swagger-ui.html").permitAll();
                auth.requestMatchers("/api/portfolio/share/**").permitAll();
                auth.anyRequest().authenticated();
            })
            .userDetailsService(customUserDetailsService)
            .addFilterBefore(corsFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)

            .formLogin(form -> form
                .loginProcessingUrl("/api/auth/login")
                .usernameParameter("email")
                .passwordParameter("password")
                .successHandler((request, response, authentication) -> {
                    // 로그인 성공 시 토큰 생성
                    String accessToken = tokenProvider.createAccessToken(authentication);
                    String refreshToken = tokenProvider.createRefreshToken(authentication);

                    // 쿠키 생성 및 설정
                    Cookie accessTokenCookie = new Cookie("accessToken", accessToken);
                    Cookie refreshTokenCookie = new Cookie("refreshToken", refreshToken);

                    // 쿠키 설정
                    accessTokenCookie.setHttpOnly(true);
                    accessTokenCookie.setSecure(true);
                    accessTokenCookie.setPath("/");

                    refreshTokenCookie.setHttpOnly(true);
                    refreshTokenCookie.setSecure(true);
                    refreshTokenCookie.setPath("/");

                    // 쿠키 추가
                    response.addCookie(accessTokenCookie);
                    response.addCookie(refreshTokenCookie);

                    response.setStatus(HttpServletResponse.SC_OK);
                })
                .failureHandler((request, response, exception) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"error\": \"로그인 실패: " + exception.getMessage() + "\"}");
                })
                .permitAll()
            )

            .exceptionHandling((exceptionHandling) ->
                exceptionHandling
                    .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                    .accessDeniedHandler(jwtAccessDeniedHandler)
            )

            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .oauth2Login(oauth2 ->  oauth2
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService)
                )
                .successHandler(oAuth2SuccessHandler)
                .failureHandler((request, response, exception) -> {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("OAuth 로그인 실패: " + exception.getMessage());
                })
            )
            .logout((logout) -> logout
                .logoutUrl("/api/auth/logout")
                .logoutSuccessHandler((request, response, authentication) -> {
                    // 로그아웃 시 쿠키 삭제
                    Cookie accessTokenCookie = new Cookie("accessToken", null);
                    Cookie refreshTokenCookie = new Cookie("refreshToken", null);

                    accessTokenCookie.setMaxAge(0);
                    refreshTokenCookie.setMaxAge(0);

                    accessTokenCookie.setPath("/");
                    refreshTokenCookie.setPath("/");

                    response.addCookie(accessTokenCookie);
                    response.addCookie(refreshTokenCookie);

                    response.setStatus(HttpServletResponse.SC_OK);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"message\": \"로그아웃 성공\"}");
                })
                .deleteCookies("JSESSIONID")
            )

        ;

        return http.build();
    }


    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
        AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @PostConstruct
    public void enableAuthenticationContextOnSpawnedThreads() {
        SecurityContextHolder.setStrategyName(SecurityContextHolder.MODE_INHERITABLETHREADLOCAL);
    }
}