package com.example.ReservationSystem.models;



import com.example.ReservationSystem.enums.CategoryOfRessources;
import com.example.ReservationSystem.enums.StatusOfRessource;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class Ressource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private CategoryOfRessources category;
    private StatusOfRessource status;
    private Integer availableQuantity;

    @Version
    private Integer version;

    @JsonIgnore
    @OneToMany(fetch = FetchType.LAZY, mappedBy = "ressource", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Reservation> reservations;


}
