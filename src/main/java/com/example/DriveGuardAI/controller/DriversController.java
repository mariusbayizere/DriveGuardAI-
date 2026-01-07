package com.example.DriveGuardAI.controller;

import java.net.URI;
import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.example.DriveGuardAI.model.Drivers;
import com.example.DriveGuardAI.service.DriversService;

@RestController
@RequestMapping("/api/v1/drivers")
public class DriversController {

    private final DriversService driversService;

    public DriversController(DriversService driversService) {
        this.driversService = driversService;
    }

    @GetMapping
    public List<Drivers> list() {
        return driversService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Drivers> get(@PathVariable Long id) {
        return ResponseEntity.ok(driversService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Drivers> create(@Valid @RequestBody Drivers driver) {
        Drivers created = driversService.create(driver);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(created.getId())
            .toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Drivers> update(@PathVariable Long id, @Valid @RequestBody Drivers driver) {
        Drivers updated = driversService.update(id, driver);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        driversService.delete(id);
        return ResponseEntity.noContent().build();
    }
}