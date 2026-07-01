package com.example.ReservationSystem.exceptions;

public class UserAlreadyExistsException extends RuntimeException{
        public UserAlreadyExistsException(String message) {
        super(message);
    }
}
