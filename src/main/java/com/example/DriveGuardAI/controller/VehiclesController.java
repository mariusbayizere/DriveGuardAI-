package com.example.DriveGuardAI.controller;

import java.net.URI;
import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.example.DriveGuardAI.model.Vehicles;
import com.example.DriveGuardAI.service.VehiclesService;

@RestController
@RequestMapping("/api/v1/vehicles")
public class VehiclesController {

    private final VehiclesService vehiclesService;

    public VehiclesController(VehiclesService vehiclesService) {
        this.vehiclesService = vehiclesService;
    }

    @GetMapping
    public List<Vehicles> list() {
        return vehiclesService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vehicles> get(@PathVariable Long id) {
        return ResponseEntity.ok(vehiclesService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Vehicles> create(@Valid @RequestBody Vehicles vehicle) {
        Vehicles created = vehiclesService.create(vehicle);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(created.getVehicleId())
            .toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vehicles> update(@PathVariable Long id, @Valid @RequestBody Vehicles vehicle) {
        Vehicles updated = vehiclesService.update(id, vehicle);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        vehiclesService.delete(id);
        return ResponseEntity.noContent().build();
    }
}