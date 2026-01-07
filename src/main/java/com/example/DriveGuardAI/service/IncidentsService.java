package com.example.DriveGuardAI.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.DriveGuardAI.model.Incidents;
import com.example.DriveGuardAI.model.Drivers;
import com.example.DriveGuardAI.model.Trips;
import com.example.DriveGuardAI.model.Vehicles;
import com.example.DriveGuardAI.repository.IncidentRepository;
import com.example.DriveGuardAI.repository.DriverRepository;
import com.example.DriveGuardAI.repository.TripRepository;
import com.example.DriveGuardAI.repository.VehiclesRepository;

@Service
@Transactional
public class IncidentsService {

    private final IncidentRepository incidentRepository;
    private final DriverRepository driverRepository;
    private final TripRepository tripsRepository;
    private final VehiclesRepository vehiclesRepository;

    public IncidentsService(
        IncidentRepository incidentRepository,
        DriverRepository driverRepository,
        TripRepository tripsRepository,
        VehiclesRepository vehiclesRepository
    ) {
        this.incidentRepository = incidentRepository;
        this.driverRepository = driverRepository;
        this.tripsRepository = tripsRepository;
        this.vehiclesRepository = vehiclesRepository;
    }

    public List<Incidents> findAll() {
        return incidentRepository.findAll();
    }

    public Incidents findById(Long id) {
        return incidentRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incident not found"));
    }

    public Incidents create(Incidents incident) {
        // basic validation
        if (incident.getIncident_type() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "incident_type is required");
        }
        if (incident.getSeverity() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "severity is required");
        }
        if (incident.getTimestamp() == null || incident.getTimestamp().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "timestamp is required");
        }

        if (incident.getDriver() == null || incident.getDriver().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "driver id is required");
        }
        if (incident.getTrip() == null || incident.getTrip().getTripId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "trip id is required");
        }
        if (incident.getVehicle() == null || incident.getVehicle().getVehicleId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "vehicle id is required");
        }

        Drivers driver = driverRepository.findById(incident.getDriver().getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Driver not found"));
        Trips trip = tripsRepository.findById(incident.getTrip().getTripId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trip not found"));
        Vehicles vehicle = vehiclesRepository.findById(incident.getVehicle().getVehicleId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vehicle not found"));

        incident.setIncident_id(null);
        incident.setDriver(driver);
        incident.setTrip(trip);
        incident.setVehicle(vehicle);

        return incidentRepository.save(incident);
    }

    public Incidents update(Long id, Incidents payload) {
        Incidents existing = incidentRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incident not found"));

        if (payload.getIncident_type() != null) existing.setIncident_type(payload.getIncident_type());
        if (payload.getDescription() != null) existing.setDescription(payload.getDescription());
        if (payload.getSeverity() != null) existing.setSeverity(payload.getSeverity());
        if (payload.getTimestamp() != null) existing.setTimestamp(payload.getTimestamp());

        if (payload.getDriver() != null && payload.getDriver().getId() != null) {
            Drivers driver = driverRepository.findById(payload.getDriver().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Driver not found"));
            existing.setDriver(driver);
        }

        if (payload.getTrip() != null && payload.getTrip().getTripId() != null) {
            Trips trip = tripsRepository.findById(payload.getTrip().getTripId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trip not found"));
            existing.setTrip(trip);
        }

        if (payload.getVehicle() != null && payload.getVehicle().getVehicleId() != null) {
            Vehicles vehicle = vehiclesRepository.findById(payload.getVehicle().getVehicleId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vehicle not found"));
            existing.setVehicle(vehicle);
        }

        return incidentRepository.save(existing);
    }

    public void delete(Long id) {
        if (!incidentRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Incident not found");
        }
        incidentRepository.deleteById(id);
    }
}