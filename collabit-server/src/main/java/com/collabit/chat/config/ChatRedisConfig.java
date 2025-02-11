package com.collabit.chat.config;

import com.collabit.chat.redis.RedisSubscriber;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;

@Configuration
public class ChatRedisConfig {

    //Redis 메시지 수신을 위한 채널 토픽 설정
    @Bean
    public ChannelTopic channelTopic() {
        return new ChannelTopic("chat");
    }

    //Redis 메시지 수신 및 처리를 위한 리스너 등록
    @Bean
    public RedisMessageListenerContainer redisMessageListener(
            RedisConnectionFactory connectionFactory,
            MessageListenerAdapter listenerAdapterChatMessage,
            ChannelTopic channelTopic) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener(listenerAdapterChatMessage, channelTopic);
        return container;
    }

    //RedisSubscriber를 통해 "sendMessage" 메서드를 리스너로 연결
    @Bean
    public MessageListenerAdapter listenerAdapterChatMessage(RedisSubscriber subscriber) {
        return new MessageListenerAdapter(subscriber, "onMessage");
    }
}