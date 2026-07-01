package com.example.ReservationSystem.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.example.ReservationSystem.Dao.ErrorResponse;




@RestControllerAdvice
public class GlobalExceptionHandler{
    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleExists(UserAlreadyExistsException ex){
        ErrorResponse error = ErrorResponse.builder()
            .message(ex.getMessage())
            .status(HttpStatus.BAD_REQUEST.value())
            .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}
