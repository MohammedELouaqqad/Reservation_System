package com.example.ReservationSystem.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

import static org.springframework.http.HttpMethod.*;
import static org.springframework.security.config.http.SessionCreationPolicy.STATELESS;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {


    private final JwtAuthentificationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;
    private final CorsConfigurationSource corsConfigurationSource;


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception{
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .authorizeHttpRequests(req ->
                        req
                            .requestMatchers(OPTIONS, "/**").permitAll()
                            .requestMatchers(GET, "/api/auth/allUsers").hasAuthority("ADMIN")
                            .requestMatchers(POST, "/api/auth/authenticate").permitAll()
                            .requestMatchers(POST, "/api/auth/register").permitAll()
                            .requestMatchers(POST, "/api/ressources").hasAuthority("ADMIN")
                            .requestMatchers(PUT, "/api/ressources/**").hasAuthority("ADMIN")
                            .requestMatchers(DELETE, "/api/ressources/**").hasAuthority("ADMIN")
                            .requestMatchers(GET, "/api/ressources").authenticated()
                            .requestMatchers(POST, "/api/reservations").authenticated()
                            .requestMatchers(DELETE, "/api/reservations/**").hasAuthority("ADMIN")
                            .requestMatchers(GET, "/api/reservations").authenticated()
                            .anyRequest().authenticated()
                )

                .sessionManagement(session -> session.sessionCreationPolicy(STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}