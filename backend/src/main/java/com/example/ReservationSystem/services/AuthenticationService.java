package com.example.ReservationSystem.services;

import com.example.ReservationSystem.Dao.AuthenticationRequest;
import com.example.ReservationSystem.Dao.AuthenticationResponse;
import com.example.ReservationSystem.Dao.RegisterRequest;
import com.example.ReservationSystem.Repository.UserRepository;
import com.example.ReservationSystem.enums.RoleOfUser;
import com.example.ReservationSystem.exceptions.UserAlreadyExistsException;
import com.example.ReservationSystem.models.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthenticationService {



    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;


    public ResponseEntity<List<User>> getAllUsers(){
        return ResponseEntity.ok(repository.findAll());
    }


    public AuthenticationResponse authenticate(AuthenticationRequest request){

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        var user = repository.findByEmail(request.getEmail())
                .orElseThrow();

        var jwtToken = jwtService.generateToken(user);

        return AuthenticationResponse.builder()
                .user(user)
                .token(jwtToken)
                .build();

    }
    public AuthenticationResponse register( RegisterRequest request){

         if(repository.existsUserByEmail(request.getEmail())){
                throw new UserAlreadyExistsException("This Email already used");
        }
        
        var newUser = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(RoleOfUser.USER)
                .build();

        repository.save(newUser);
        var jwtToken = jwtService.generateToken(newUser);

        return AuthenticationResponse.builder()
                .user(newUser)
                .token(jwtToken)
                .build();
    }
}