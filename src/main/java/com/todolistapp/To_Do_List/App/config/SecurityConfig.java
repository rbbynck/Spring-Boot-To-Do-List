package com.todolistapp.To_Do_List.App.config;

import com.todolistapp.To_Do_List.App.model.User;
import com.todolistapp.To_Do_List.App.repository.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.cors.CorsConfiguration;

import java.util.Optional;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(Customizer.withDefaults())
                .cors(cors -> cors.configurationSource(request -> new CorsConfiguration().applyPermitDefaultValues()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/to-do-list/register", "/to-do-list/login").permitAll()
                        .anyRequest().authenticated() // Allow all requests (adjust as needed)
                )
                .formLogin(form -> form
                        .loginPage("/to-do-list/login")
                        .successHandler(customSuccessHandler())
                        .permitAll()
                )
                .logout(logout -> logout
                        .logoutUrl("/to-do-list/logout")
                        .logoutSuccessUrl("/to-do-list/login?logout")
                        .invalidateHttpSession(true) // Invalidate session
                        .clearAuthentication(true) // Clear authentication
                        .deleteCookies("JSESSIONID")
                        .permitAll()
                );
        return http.build();
    }

    @Bean
    public AuthenticationSuccessHandler customSuccessHandler() {
        return (request, response, authentication) -> {
            response.sendRedirect("/to-do-list/home"); // Redirect USER to home page
        };
    }

    @Bean
    public UserDetailsService userDetailsService(UserRepository userRepository) {
        return credential -> {
            Optional<User> user;
            if (userRepository.findByUsername(credential).isPresent()) {
                user = userRepository.findByUsername(credential);
            } else if (userRepository.findByEmail(credential).isPresent()) {
                user = userRepository.findByEmail(credential);
            } else {
                throw new UsernameNotFoundException("User not found");
            }


            return org.springframework.security.core.userdetails.User
                    .withUsername(user.get().getUsername())
                    .password(user.get().getPassword())
                    .roles("USER")
                    .build();
        };
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
