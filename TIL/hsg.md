# 2025-01-13
jira에 대해서 배웠습니다 ^ㅇ^
폭포수 모델이 기획 -> 개발 진행되는동안 전단계로 돌아갈 수 없음! 요구사항 추가 불가
그래서 스프린트단위로 조금 개발하고 피드백하고 또 개발하고 피드백하고.. 애자일 방식으로 개발을 많이하는데
이러한 애자일 방법 개발을 관리하기 위한 도구!
백로그(요구사항, 진행상황), 스프린트 단위 개발내용, 회의록, 등등.. 적으면서 팀단위로 관리할 수 있는 도구가 jira!



# 2025-01-14
우리 프로젝트에서 DB 뭘 쓸까 하다가 매번 쓰던 RDBMS MYSQL 외에도 NoSQL같은 비관계형 DB에 대해 찾아봤습니다!
NoSQL은 대용량 데이터 저장에 좋고 분산 저장(CAP원칙칙), 빠른 읽기/쓰기가 좋다. 
단점이
Consistency(일관성) 데이터 정합성이 보장되지 않을 수 있다 인데.. application에서 개
발자들이 관리해야줘야 한다고함
일단 우리 데이터가 채팅, 답변, 질문다 정해진 형식이 없는 text라서 (질문(key) : 답변
(value) 이렇게) 한 document에 저장하거나 동적으로 확장 가능하게 NoSQL 필요성을 느꼈다!
스키마가 제약이 없어서 유연하기 때문


# 2025-01-15
figma 사용법에 대해 배웠습니당. 하나하나 직접 만들기 너무 어려웠는데..
알고보니 UI component 만들어진 것 가져다 쓰는게 훨 편했습니다.
직접 컴포넌트 가져와보면서 배치 해봤습니다!!
make component하면 연관된 애들도 한번에 바뀌는게 정말 신기..


# 2025-01-16
jira를 통한 백로그 관리를 수행해보았습니다.
저희 서비스가 github oauth로그인을 제공할 것이기 때문에, oauth의 과정에 대해 공부해보았습니다.
authrization(인가)와 authentication(인증)의 차이를 알아보았습니다.


# 2025-01-17
공가ㅠ_ㅠㅠ


# 2025-01-20
회원가입/로그인 관련련
jira에 epic, story, task 작성
story에 적을 issue 템플릿 작성(api, service, controller이름, parameter정도 작성)
+ spring security공부, DDD설계패턴 공부(+ repository vs DAO차이이)


# 2025-01-21
jwt구현전에 이론들 공부했습니다!
cookie, session, jwt
대칭키, 비대칭키(공개키,개인키키)

언어설정 화면 밝기 (개인화), 장바구니, 게임점수.. 이런건 쿠키에

살짝 민감한 장바구니, 찜목록은 세션에(쿠키에 넣어두되긴함)

jwt에는 인증/인가 정보만(id, 이름, 권한, 로그인상태 거의 변경안되는 데이터)

jwt에는 인증/인가 정보만(id, 이름, 권한, 로그인상태 거의 변경안되는 데이터)

# 2025-01-22
실제 개발 시작했습니다!
TokenProvider: 유저 정보로 JWT 토근 생성 or 토큰에서 유저정보 가져오는 역할
jwtFilter: request마다 jwt검증하는 필터 추가
JwtSecurityConfig: 직접 만든 TokenProvider 와 JwtFilter 를 SecurityConfig에 적용!
이런 설정위주 클래스들 완성..
이제 로그인, 회원가입 service controller로직짜고 refreshtoken 해야합니당..

# 2025-01-23
access token과 refresh token의 주로 구현하는 방식이 jwt형태이지
jwt = access/refresh token이 아님!

왜 jwt나 oauth를 사용할 땐 csrf 공격을 방어하지 않아도 될까?
=> csrf는 cookie를 통해 인증된 사용자에게 자기도 모르는새 악성 요청을 보내게 하는 공격방법
JWT와 OAuth는 보통 쿠키 대신 **HTTP 헤더(Authorization 헤더)**에 인증 정보를 포함합니다.
CSRF 공격은 브라우저가 자동으로 쿠키를 전송하는 점을 악용하지만, 헤더를 설정하는 요청은 브라우저에서 자동으로 만들어지지 않으므로 CSRF 공격에 취약하지 않습니다.

# 2025-01-24
회원가입, 로그인 swagger로 테스트 완료했습니다!
CustomUserDetail, CustomUserDetailService를 만들어야 FE,BE 다른분들이 사용하기 수월함을 배웠습니다.
해당 클래스 사용 이유 사용자 정보를 추가로 포함하려고

Spring Security의 기본 UserDetails 인터페이스는 username, password, authorities만 제공함!!
하지만 애플리케이션에서 사용자와 관련된 추가 정보(code, nickname, profileImage, githubId 등)가 필요할 때, CustomUserDetails를 만들어서 이러한 정보를 포함시킬 수 있음음
예: 로그인한 사용자 정보를 반환할 때 추가적인 정보를 포함해야 한다면 기본 UserDetails로는 한계가 있다고 합니다.

CustomUserDetailsService의 역할(얘가 자동으로 인증과정에서 추가한 값들을 채워줌줌)

Spring Security가 인증을 시도할 때 UsernamePasswordAuthenticationToken을 사용하여 사용자 정보를 조회합니다.
이 과정에서 UserDetailsService 구현체(CustomUserDetailsService)의 "loadUserByUsername 메서드"(override해놓은 놈)를 호출합니다.
(AuthenticationManager가 CustomUserDetailsService의 loadUserByUsername 호출)
loadUserByUsername 메서드에서 반환된 CustomUserDetails 객체를 Authentication 객체에 저장합니다.
때문에 
// 사용자 인증 후
        Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);

// db에 또 접근하지 말고 Authentication 객체에서 CustomUserDetails 가져오기 가능!
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

# 2025-01-31
mongoDB를 처음 사용해보았습니다!
repository interface를 만들 때 extends MongoRepository<T, I> 의 의미
T=document, I=id타입
document entity에 지정해준 collection에 저장해준다! 자동으로 CRUD메서드 제공

findById(ID id)	ID로 엔티티 조회
findAll()	모든 데이터 조회
deleteById(ID id)	ID로 데이터 삭제.. 와같이 기본제공하는 메서드들도있고

deleteByQuestion(String question) → 특정 질문을 가진 데이터를 삭제
메서드 이름만 잘 정해주면 편하게 자동 메서드를 만들 수 있음!