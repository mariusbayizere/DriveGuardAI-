package com.example.DriveGuardAI.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.DriveGuardAI.model.Alters;
import com.example.DriveGuardAI.model.Incidents;
import com.example.DriveGuardAI.model.Users;
import com.example.DriveGuardAI.repository.AltersRepository;
import com.example.DriveGuardAI.repository.IncidentRepository;
import com.example.DriveGuardAI.repository.UserRepository;

@Service
@Transactional
public class AltersService {

    private final AltersRepository altersRepository;
    private final UserRepository userRepository;
    private final IncidentRepository incidentRepository;

    public AltersService(AltersRepository altersRepository,
                         UserRepository userRepository,
                         IncidentRepository incidentRepository) {
        this.altersRepository = altersRepository;
        this.userRepository = userRepository;
        this.incidentRepository = incidentRepository;
    }

    public List<Alters> findAll() {
        return altersRepository.findAll();
    }

    public Alters findById(Long id) {
        return altersRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alert not found"));
    }

    public List<Alters> findByUserId(Long userId) {
        return altersRepository.findByUserId(userId);
    }

    public Alters create(Alters alert) {
        // basic validation
        if (alert.getMessage() == null || alert.getMessage().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message is required");
        }
        if (alert.getSentAt() == null || alert.getSentAt().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "SentAt is required");
        }
        if (alert.getStatus() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status is required");
        }
        if (alert.getUser() == null || alert.getUser().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User id is required");
        }
        if (alert.getIncident() == null || alert.getIncident().getIncident_id() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Incident id is required");
        }

        Users user = userRepository.findById(alert.getUser().getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found"));
        Incidents incident = incidentRepository.findById(alert.getIncident().getIncident_id())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Incident not found"));

        alert.setId(null);
        alert.setUser(user);
        alert.setIncident(incident);

        return altersRepository.save(alert);
    }

    public Alters update(Long id, Alters payload) {
        Alters existing = altersRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alert not found"));

        if (payload.getMessage() != null) existing.setMessage(payload.getMessage());
        if (payload.getSentAt() != null) existing.setSentAt(payload.getSentAt());
        if (payload.getStatus() != null) existing.setStatus(payload.getStatus());

        if (payload.getUser() != null && payload.getUser().getId() != null) {
            Users user = userRepository.findById(payload.getUser().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found"));
            existing.setUser(user);
        }

        if (payload.getIncident() != null && payload.getIncident().getIncident_id() != null) {
            Incidents incident = incidentRepository.findById(payload.getIncident().getIncident_id())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Incident not found"));
            existing.setIncident(incident);
        }

        return altersRepository.save(existing);
    }

    public void delete(Long id) {
        if (!altersRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Alert not found");
        }
        altersRepository.deleteById(id);
    }
}