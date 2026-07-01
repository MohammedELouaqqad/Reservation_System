package com.example.ReservationSystem.controllers;


import com.example.ReservationSystem.models.Ressource;
import com.example.ReservationSystem.services.RessourceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ressources")
public class RessourceController {

    private final RessourceService ressourceService;


    public RessourceController(RessourceService ressourceService) {
        this.ressourceService = ressourceService;
    }


    @GetMapping
    public ResponseEntity<List<Ressource>> getAllRessources(){
        return ResponseEntity.ok(ressourceService.getAllRessources());
    }


    @GetMapping("/{id}")
    public ResponseEntity<Ressource> getRessourceById(@PathVariable Long id){
        return ResponseEntity.ok(ressourceService.getRessourceById(id));
    }

    @PostMapping
    public ResponseEntity<String> createRessource(@RequestBody Ressource newRessource){
        System.out.println("HIII:"+newRessource);
        ressourceService.createRessouce(newRessource);
        return ResponseEntity.ok("Ressource created with success");
    }
    

    @PutMapping("/{id}")
    public ResponseEntity<String> updateRessource(@RequestBody Ressource newRessource, @PathVariable Long id){
            ressourceService.updateRessource(newRessource,id);
            return ResponseEntity.ok("Ressource updated with success");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteRessource(@PathVariable Long id){
            ressourceService.deleteRessource(id);
            return ResponseEntity.ok("Ressource deleted with success");
    }
}
