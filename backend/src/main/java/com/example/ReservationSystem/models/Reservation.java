package com.example.ReservationSystem.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer quantity;

    private LocalDateTime startDateTime;

    private LocalDateTime endDateTime;

    @ManyToOne
    private User user;

    @ManyToOne
    private Ressource ressource;
}
