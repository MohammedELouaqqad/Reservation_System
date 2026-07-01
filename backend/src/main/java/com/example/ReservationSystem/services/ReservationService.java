package com.example.ReservationSystem.services;

import com.example.ReservationSystem.Repository.ReservationRepository;
import com.example.ReservationSystem.Repository.RessourceRepository;
import com.example.ReservationSystem.Repository.UserRepository;
import com.example.ReservationSystem.enums.StatusOfRessource;
import com.example.ReservationSystem.exceptions.ReservationNotFoundException;
import com.example.ReservationSystem.exceptions.RessourceNotAvailableQauntityException;
import com.example.ReservationSystem.models.Reservation;
import com.example.ReservationSystem.models.Ressource;
import com.example.ReservationSystem.models.User;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReservationService {
    private final ReservationRepository reservationRepository;
    private final RessourceRepository ressourceRepository;
    private final UserRepository userRepository;

    public ReservationService(
            ReservationRepository reservationRepository,
            RessourceRepository ressourceRepository,
            UserRepository userRepository
    ) {
        this.reservationRepository = reservationRepository;
        this.ressourceRepository = ressourceRepository;
        this.userRepository = userRepository;
    }

    public List<Reservation> getAllReservations(String userEmail, boolean isAdmin) {
        if (isAdmin) {
            return reservationRepository.findAll();
        }
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ReservationNotFoundException("User not found"));
        return reservationRepository.findByUser_Id(user.getId());
    }

    @Transactional
    public void createReservation(Reservation reservation, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        reservation.setUser(user);

        if (reservation.getRessource() == null) {
            throw new NullPointerException("Ressource is Null");
        }

        Ressource ressource = ressourceRepository.findByIdWithLock(
                reservation.getRessource().getId()
        ).orElseThrow(() -> new RuntimeException("Ressource non trouvée"));
        reservation.setRessource(ressource);

        if (ressource.getStatus() == StatusOfRessource.BUSY || ressource.getAvailableQuantity() <= 0) {
            throw new RuntimeException("Ressource indisponible");
        }

        if (reservation.getQuantity() == null || reservation.getQuantity() <= 0) {
            throw new RessourceNotAvailableQauntityException("This quantity not valid");
        }
        if (ressource.getAvailableQuantity() < reservation.getQuantity()) {
            throw new RessourceNotAvailableQauntityException("This quantity not available");
        }

        ressource.setAvailableQuantity(ressource.getAvailableQuantity() - reservation.getQuantity());
        if (ressource.getAvailableQuantity() == 0) {
            ressource.setStatus(StatusOfRessource.BUSY);
        }
        ressourceRepository.save(ressource);
        reservationRepository.save(reservation);
    }

    @Transactional
    public void deleteReseravtion(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ReservationNotFoundException("No found reservation with this ID"));
        reservation.getRessource().setAvailableQuantity(
                reservation.getRessource().getAvailableQuantity() + reservation.getQuantity()
        );

        if (reservation.getRessource().getAvailableQuantity() > 0) {
            reservation.getRessource().setStatus(StatusOfRessource.FREE);
        }
        ressourceRepository.save(reservation.getRessource());
        reservationRepository.deleteById(id);
    }
}
