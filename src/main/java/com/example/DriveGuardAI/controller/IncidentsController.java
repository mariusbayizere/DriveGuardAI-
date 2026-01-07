package com.example.DriveGuardAI.controller;

import java.net.URI;
import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.example.DriveGuardAI.model.Incidents;
import com.example.DriveGuardAI.service.IncidentsService;

@RestController
@RequestMapping("/api/v1/incidents")
public class IncidentsController {

    private final IncidentsService incidentsService;

    public IncidentsController(IncidentsService incidentsService) {
        this.incidentsService = incidentsService;
    }

    @GetMapping
    public List<Incidents> list() {
        return incidentsService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Incidents> get(@PathVariable Long id) {
        return ResponseEntity.ok(incidentsService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Incidents> create(@Valid @RequestBody Incidents incident) {
        Incidents created = incidentsService.create(incident);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(created.getIncident_id())
            .toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Incidents> update(@PathVariable Long id, @Valid @RequestBody Incidents incident) {
        Incidents updated = incidentsService.update(id, incident);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        incidentsService.delete(id);
        return ResponseEntity.noContent().build();
    }
}