package com.example.ReservationSystem.controllers;

import com.example.ReservationSystem.Dao.AuthenticationRequest;
import com.example.ReservationSystem.Dao.AuthenticationResponse;
import com.example.ReservationSystem.Dao.RegisterRequest;
import com.example.ReservationSystem.models.User;
import com.example.ReservationSystem.services.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {


    private final AuthenticationService service;

    @GetMapping("/allUsers")
    public ResponseEntity<List<User>> getAllUsers(){
        return service.getAllUsers();
    }

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(
            @RequestBody RegisterRequest request
    ){
        return ResponseEntity.ok(service.register(request));
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request
    ){
        return ResponseEntity.ok(service.authenticate(request));
    }
}
