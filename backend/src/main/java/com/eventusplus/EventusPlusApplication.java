package com.eventusplus;

import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@ConfigurationPropertiesScan
public class EventusPlusApplication {

    public static void main(String[] args) {
        SpringApplication.run(EventusPlusApplication.class, args);
    }
}
