package com.collabit.global.config;

import com.collabit.chat.redis.RedisSubscriber;
import com.collabit.project.redis.ProjectRedisSubscriber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableRedisRepositories
@EnableTransactionManagement
@EnableCaching
public class RedisConfig {

    @Value("${spring.redis.host}")
    private String host;

    @Value("${spring.redis.port}")
    private int port;

	// Redis 연결 설정
	@Bean
	public RedisConnectionFactory redisConnectionFactory() {
		return new LettuceConnectionFactory(host, port);
	}

	@Bean
	public RedisTemplate<String, Object> redisTemplate() {
		RedisTemplate<String, Object> template = new RedisTemplate<>();
		template.setConnectionFactory(redisConnectionFactory());
		template.setKeySerializer(new StringRedisSerializer());
		template.setValueSerializer(new Jackson2JsonRedisSerializer<>(Object.class));
		return template;
	}

	// 추가된 String 전용 template
	@Bean(name = "customStringRedisTemplate")
	public RedisTemplate<String, String> stringRedisTemplate() {
		RedisTemplate<String, String> template = new RedisTemplate<>();
		template.setConnectionFactory(redisConnectionFactory());
		template.setKeySerializer(new StringRedisSerializer());
		template.setValueSerializer(new StringRedisSerializer());
		return template;
	}

	// 채팅 관련 Redis 설정
	//Redis 메시지 수신을 위한 채널 토픽 설정
	@Bean
	public ChannelTopic channelTopic() {
		return new ChannelTopic("chat");
	}

	@Bean
	public MessageListenerAdapter chatMessageListenerAdapter(RedisSubscriber subscriber) {
		return new MessageListenerAdapter(subscriber, "onMessage");
	}

	// 프로젝트 관련 Redis Subscriber 설정
	@Bean
	public MessageListenerAdapter projectListenerAdapter(ProjectRedisSubscriber subscriber) {
		return new MessageListenerAdapter(subscriber);
	}

	// 통합된 Redis Message Listener Container
	@Bean
	public RedisMessageListenerContainer redisMessageListenerContainer(
			RedisConnectionFactory connectionFactory,
			MessageListenerAdapter chatMessageListenerAdapter,
			MessageListenerAdapter projectListenerAdapter,
			ChannelTopic channelTopic) {
		RedisMessageListenerContainer container = new RedisMessageListenerContainer();
		container.setConnectionFactory(connectionFactory);

		// 채팅 메시지 리스너 등록
		container.addMessageListener(chatMessageListenerAdapter, channelTopic);

		// 채팅 키 이벤트 리스너 등록
		container.addMessageListener(chatMessageListenerAdapter, new PatternTopic("__keyevent@*__:*"));

		// 프로젝트 키 이벤트 리스너 등록
		container.addMessageListener(projectListenerAdapter, new PatternTopic("__keyevent@*__:*"));

		return container;
	}
}
