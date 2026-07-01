package com.example.ReservationSystem.controllers;

import com.example.ReservationSystem.models.Reservation;
import com.example.ReservationSystem.services.ReservationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {
    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @GetMapping
    public ResponseEntity<List<Reservation>> getAllReservations(Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ADMIN"));
        return ResponseEntity.ok(
                reservationService.getAllReservations(authentication.getName(), isAdmin)
        );
    }

    @PostMapping
    public ResponseEntity<String> createReservation(
            @RequestBody Reservation newReservation,
            Authentication authentication
    ) {
        reservationService.createReservation(newReservation, authentication.getName());
        return ResponseEntity.ok("Reservation created with success");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteReservation(@PathVariable Long id) {
        reservationService.deleteReseravtion(id);
        return ResponseEntity.ok("Reservation deleted with success");
    }
}
