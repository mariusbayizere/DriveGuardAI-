package com.example.DriveGuardAI.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.DriveGuardAI.model.Users;
import com.example.DriveGuardAI.repository.UserRepository;

@Service
@Transactional
public class UsersService {

    private final UserRepository userRepository;

    public UsersService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<Users> findAll() {
        return userRepository.findAll();
    }

    public Users findById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    public Users create(Users user) {
        if (user.getEmail() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        if (userRepository.findByEmail(user.getEmail()) != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        }
        // ensure id is null so repository will create
        user.setId(null);
        return userRepository.save(user);
    }

    public Users update(Long id, Users payload) {
        Users existing = findById(id);
        // update allowed fields
        existing.setFirstName(payload.getFirstName());
        existing.setLastName(payload.getLastName());
        existing.setPhoneNumber(payload.getPhoneNumber());
        existing.setUserRole(payload.getUserRole());
        
        // update password/email only if provided (adjust policy as needed)
        if (payload.getPassword() != null && !payload.getPassword().isBlank()) {
            existing.setPassword(payload.getPassword());
        }
        if (payload.getEmail() != null && !payload.getEmail().equals(existing.getEmail())) {
            if (userRepository.findByEmail(payload.getEmail()) != null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already in use");
            }
            existing.setEmail(payload.getEmail());
        }
        return userRepository.save(existing);
    }

    public void delete(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        userRepository.deleteById(id);
    }
}