package com.example.ReservationSystem.services;


import com.example.ReservationSystem.Repository.ReservationRepository;
import com.example.ReservationSystem.exceptions.RessourceNotFoundException;
import com.example.ReservationSystem.models.Ressource;
import com.example.ReservationSystem.Repository.RessourceRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RessourceService {

    private final RessourceRepository ressourceRepository;
    private final ReservationRepository reservationRepository;


    public RessourceService(RessourceRepository ressourceRepository, ReservationRepository reservationRepository) {
        this.ressourceRepository = ressourceRepository;
        this.reservationRepository = reservationRepository;
    }

    public List<Ressource> getAllRessources(){
        return ressourceRepository.findAll();
    }

    public Ressource getRessourceById(Long id){
        Ressource ressource = ressourceRepository.findRessourceById(id);
        if (ressource == null) {
            throw new RessourceNotFoundException("No found ressource with this ID");
        }
        return ressource;
    }


    public void createRessouce(Ressource ressource){
        ressourceRepository.save(ressource);
    }

    public void updateRessource(Ressource newRessource, Long id){
        Ressource ressource =  ressourceRepository.findById(id)
                .orElseThrow(()-> new RessourceNotFoundException("No found ressource with this ID"));

        ressource.setCategory(newRessource.getCategory());
        ressource.setName(newRessource.getName());
        ressource.setStatus(newRessource.getStatus());
        ressource.setReservations(newRessource.getReservations());
        ressource.setAvailableQuantity(newRessource.getAvailableQuantity());
        ressourceRepository.save(ressource);
    }

    @Transactional
    public void deleteRessource(Long id){
        Ressource ressource =ressourceRepository.findRessourceById(id);
        reservationRepository.deleteAll(ressource.getReservations());
        ressourceRepository.deleteById(id);
    }
}
