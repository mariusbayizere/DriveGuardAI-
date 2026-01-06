package com.example.DriveGuardAI.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.DriveGuardAI.model.Trips;

public interface TripRepository extends JpaRepository<Trips, Long> {
    List<Trips> findByUserId(Long userId);
}
