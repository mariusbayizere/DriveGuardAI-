/*
package com.example.DriveGuardAI.controller;

import java.net.URI;
import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.example.DriveGuardAI.model.Trips;
import com.example.DriveGuardAI.service.TripsService;

@RestController
@RequestMapping("/api/v1/trips")
public class TripsController {

    private final TripsService tripsService;

    public TripsController(TripsService tripsService) {
        this.tripsService = tripsService;
    }

    @GetMapping
    public List<Trips> list() {
        return tripsService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Trips> get(@PathVariable Long id) {
        return ResponseEntity.ok(tripsService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Trips> create(@Valid @RequestBody Trips trip) {
        Trips created = tripsService.create(trip);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(created.getTripId())
            .toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Trips> update(@PathVariable Long id, @Valid @RequestBody Trips trip) {
        Trips updated = tripsService.update(id, trip);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        tripsService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

*/


package com.example.DriveGuardAI.controller;

import java.net.URI;
import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.example.DriveGuardAI.model.Trips;
import com.example.DriveGuardAI.service.TripsService;

@RestController
@RequestMapping("/api/v1/trips")
public class TripsController {

    private final TripsService tripsService;

    public TripsController(TripsService tripsService) {
        this.tripsService = tripsService;
    }

    @GetMapping
    public List<Trips> list() {
        return tripsService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Trips> get(@PathVariable Long id) {
        return ResponseEntity.ok(tripsService.findById(id));
    }

    // ✅ NEW: Get all trips for a driver by their driver ID.
    // The React DriverPortal calls GET /api/v1/trips/driver/{driverId}
    // after resolving the driver ID from /api/v1/drivers/user/{userId}.
    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<Trips>> getByDriver(@PathVariable Long driverId) {
        return ResponseEntity.ok(tripsService.findByDriverId(driverId));
    }

    @PostMapping
    public ResponseEntity<Trips> create(@Valid @RequestBody Trips trip) {
        Trips created = tripsService.create(trip);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(created.getTripId())
            .toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Trips> update(@PathVariable Long id, @Valid @RequestBody Trips trip) {
        Trips updated = tripsService.update(id, trip);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        tripsService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
