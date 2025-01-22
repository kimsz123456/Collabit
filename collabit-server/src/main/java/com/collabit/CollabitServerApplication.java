package com.collabit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class CollabitServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(CollabitServerApplication.class, args);
	}

}
