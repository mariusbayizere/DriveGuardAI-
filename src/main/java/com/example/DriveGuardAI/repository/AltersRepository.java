package com.example.DriveGuardAI.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.DriveGuardAI.model.Alters;

public interface AltersRepository extends JpaRepository<Alters, Long> {
    List<Alters> findByUserId(Long userId);
}
