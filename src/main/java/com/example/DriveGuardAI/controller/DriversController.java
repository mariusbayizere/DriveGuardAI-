

/*
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

*/

package com.example.DriveGuardAI.controller;

import java.net.URI;
import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.example.DriveGuardAI.model.Drivers;
import com.example.DriveGuardAI.service.DriversService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/drivers")
@Tag(name = "Drivers", description = "Driver management APIs")
public class DriversController {

    private final DriversService driversService;

    public DriversController(DriversService driversService) {
        this.driversService = driversService;
    }

    @Operation(summary = "List all drivers")
    @GetMapping
    public List<Drivers> list() {
        return driversService.findAll();
    }

    @Operation(summary = "Get driver by driver ID")
    @GetMapping("/{id}")
    public ResponseEntity<Drivers> get(@PathVariable Long id) {
        return ResponseEntity.ok(driversService.findById(id));
    }

    // ✅ NEW: Fetch driver record by the linked user's ID.
    // The React DriverPortal resolves the logged-in user's ID (e.g. 14) and
    // calls GET /api/v1/drivers/user/14 to get the driver profile.
    // This is different from GET /{id} which uses the driver's own PK.
    @Operation(summary = "Get driver by user ID")
    @GetMapping("/user/{userId}")
    public ResponseEntity<Drivers> getByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(driversService.findByUserId(userId));
    }

    @Operation(
        summary = "Create a new driver",
        description = "Safety score is automatically set to 100. Do not pass safetyScore in the request body.")
    @PostMapping
    public ResponseEntity<Drivers> create(@Valid @RequestBody Drivers driver) {
        Drivers created = driversService.create(driver);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(created.getId())
            .toUri();
        return ResponseEntity.created(location).body(created);
    }

    @Operation(summary = "Update driver details")
    @PutMapping("/{id}")
    public ResponseEntity<Drivers> update(@PathVariable Long id, @Valid @RequestBody Drivers driver) {
        return ResponseEntity.ok(driversService.update(id, driver));
    }

    @Operation(summary = "Delete a driver")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        driversService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
