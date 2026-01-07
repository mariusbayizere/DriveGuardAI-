package com.example.DriveGuardAI.controller;

import java.net.URI;
import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.example.DriveGuardAI.model.Alters;
import com.example.DriveGuardAI.service.AltersService;

@RestController
@RequestMapping("/api/v1/alerts")
public class AltersController {

    private final AltersService altersService;

    public AltersController(AltersService altersService) {
        this.altersService = altersService;
    }

    @GetMapping
    public List<Alters> list() {
        return altersService.findAll();
    }

    @GetMapping("/user/{userId}")
    public List<Alters> listByUser(@PathVariable Long userId) {
        return altersService.findByUserId(userId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Alters> get(@PathVariable Long id) {
        return ResponseEntity.ok(altersService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Alters> create(@Valid @RequestBody Alters alert) {
        Alters created = altersService.create(alert);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(created.getId())
            .toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Alters> update(@PathVariable Long id, @Valid @RequestBody Alters alert) {
        Alters updated = altersService.update(id, alert);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        altersService.delete(id);
        return ResponseEntity.noContent().build();
    }
}