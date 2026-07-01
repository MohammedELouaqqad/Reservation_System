package com.example.ReservationSystem.Repository;

import com.example.ReservationSystem.models.Ressource;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;


public interface RessourceRepository extends JpaRepository<Ressource,Long> {

    Ressource findRessourceById(Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM Ressource r WHERE r.id = :id")
    Optional<Ressource> findByIdWithLock(@Param("id") Long id);
}
