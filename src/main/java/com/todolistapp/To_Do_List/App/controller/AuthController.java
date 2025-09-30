package com.todolistapp.To_Do_List.App.controller;

import com.todolistapp.To_Do_List.App.model.User;
import com.todolistapp.To_Do_List.App.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@Controller
@RequestMapping("/to-do-list")
public class AuthController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Display home page
    @GetMapping("/home")
    public String home() {
        return "home";
    }

    @GetMapping("/login")
    public String login(Authentication authentication) {
        // If user is already logged in, redirect them to home when they're accessing the login/register form
        if (authentication != null && authentication.isAuthenticated()) {
            return "redirect:/to-do-list/home";
        }

        return "login";
    }

    @GetMapping("/register")
    public String register(Model model, Authentication authentication) {
        // If user is already logged in, redirect them to home when they're accessing the login/register form
        if (authentication != null && authentication.isAuthenticated()) {
            return "redirect:/to-do-list/home";
        }
        model.addAttribute("user", new User());
        return "register";
    }

    @PostMapping("/register")
    public String registerUser(User user, Model model, @RequestParam("confirm-password") String confirmPassword) {
        // Check username if its already taken
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            model.addAttribute("error", "Username already exists");
            return "register";
        }
        // Check email if its already taken
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            model.addAttribute("error", "Email already taken");
            return "register";
        }

        // Check if password matches confirm password
        if (!user.getPassword().equals(confirmPassword)) {
            model.addAttribute("error", "Password didn't match");
            return "register";
        }

        // Save User
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setCreated_date(String.valueOf(LocalDateTime.now()));
        userRepository.save(user);
        return "redirect:/to-do-list/login";
    }

}
