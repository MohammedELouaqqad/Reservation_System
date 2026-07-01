package com.example.ReservationSystem.services;


import com.example.ReservationSystem.Repository.RessourceRepository;
import com.example.ReservationSystem.Repository.UserRepository;
import com.example.ReservationSystem.exceptions.RessourceNotFoundException;
import com.example.ReservationSystem.exceptions.UserNotFoundException;
import com.example.ReservationSystem.models.Ressource;
import com.example.ReservationSystem.models.User;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllUsers(){
        return userRepository.findAll();
    }


    public void createUser(User user){
        userRepository.save(user);
    }

    public void updateUser(User newUser, Long id){
        User user =  userRepository.findById(id)
                .orElseThrow(()-> new UserNotFoundException("No found user with this ID"));

        user.setEmail(newUser.getEmail());
        user.setName(newUser.getName());
        user.setRole(newUser.getRole());
        user.setPassword(newUser.getPassword());

        userRepository.save(user);
    }

    public void deleteUser(Long id){
        userRepository.deleteById(id);
    }
}
