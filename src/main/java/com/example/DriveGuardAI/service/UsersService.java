/*

package com.example.DriveGuardAI.service;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.example.DriveGuardAI.model.Users;
import com.example.DriveGuardAI.repository.UserRepository;

@Service
@Transactional
public class UsersService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UsersService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Users> findAll() {
        return userRepository.findAll();
    }

    public Users findById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    public Users create(Users user) {
        // Validate required fields
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        
        // Check if email already exists
        Optional<Users> existingUser = userRepository.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        }
        
        // Validate password for creation
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
        }
        
        if (user.getPassword().length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters");
        }
        
        // Validate password confirmation
        if (user.getConfirmPassword() == null || !user.getPassword().equals(user.getConfirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passwords do not match");
        }

        // Encode password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setId(null);
        // Clear confirmPassword to avoid any issues
        user.setConfirmPassword(null);
        
        return userRepository.save(user);
    }

    public Users update(Long id, Users payload) {
        Users existing = findById(id);
        
        // Update first name
        if (payload.getFirstName() != null && !payload.getFirstName().isBlank()) {
            existing.setFirstName(payload.getFirstName());
        }
        
        // Update last name
        if (payload.getLastName() != null && !payload.getLastName().isBlank()) {
            existing.setLastName(payload.getLastName());
        }
        
        // Update phone number
        if (payload.getPhoneNumber() != null) {
            existing.setPhoneNumber(payload.getPhoneNumber());
        }
        
        // Update role
        if (payload.getUserRole() != null) {
            existing.setUserRole(payload.getUserRole());
        }

        // Update email only if different and not already in use
        if (payload.getEmail() != null && !payload.getEmail().isBlank() && 
            !payload.getEmail().equals(existing.getEmail())) {
            Optional<Users> emailExists = userRepository.findByEmail(payload.getEmail());
            if (emailExists.isPresent()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already in use");
            }
            existing.setEmail(payload.getEmail());
        }

        // Update password only if provided and non-empty
        if (payload.getPassword() != null && !payload.getPassword().isBlank()) {
            // Validate password length
            if (payload.getPassword().length() < 8) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters");
            }
            
            // Validate password confirmation if password is provided
            if (payload.getConfirmPassword() == null || !payload.getPassword().equals(payload.getConfirmPassword())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passwords do not match");
            }
            
            // Encode and set the new password
            existing.setPassword(passwordEncoder.encode(payload.getPassword()));
        }
        
        // Always clear confirmPassword before saving to avoid validation issues
        existing.setConfirmPassword(null);

        return userRepository.save(existing);
    }

    public void delete(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        userRepository.deleteById(id);
    }
}

*/




package com.example.DriveGuardAI.service;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.example.DriveGuardAI.model.Users;
import com.example.DriveGuardAI.repository.UserRepository;

@Service
@Transactional
public class UsersService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UsersService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Users> findAll() {
        return userRepository.findAll();
    }

    public Users findById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    public Users create(Users user) {
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }

        Optional<Users> existingUser = userRepository.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        }

        if (user.getPassword() == null || user.getPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
        }

        if (user.getPassword().length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters");
        }

        if (user.getConfirmPassword() == null || !user.getPassword().equals(user.getConfirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passwords do not match");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setId(null);
        user.setConfirmPassword(null);

        return userRepository.save(user);
    }

    public Users update(Long id, Users payload) {
        Users existing = findById(id);

        if (payload.getFirstName() != null && !payload.getFirstName().isBlank()) {
            existing.setFirstName(payload.getFirstName());
        }

        if (payload.getLastName() != null && !payload.getLastName().isBlank()) {
            existing.setLastName(payload.getLastName());
        }

        if (payload.getPhoneNumber() != null) {
            existing.setPhoneNumber(payload.getPhoneNumber());
        }

        if (payload.getUserRole() != null) {
            existing.setUserRole(payload.getUserRole());
        }

        if (payload.getEmail() != null && !payload.getEmail().isBlank() &&
            !payload.getEmail().equals(existing.getEmail())) {
            Optional<Users> emailExists = userRepository.findByEmail(payload.getEmail());
            if (emailExists.isPresent()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already in use");
            }
            existing.setEmail(payload.getEmail());
        }

        if (payload.getPassword() != null && !payload.getPassword().isBlank()) {
            if (payload.getPassword().length() < 8) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters");
            }

            if (payload.getConfirmPassword() == null || !payload.getPassword().equals(payload.getConfirmPassword())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passwords do not match");
            }

            existing.setPassword(passwordEncoder.encode(payload.getPassword()));
        }

        existing.setConfirmPassword(null);

        return userRepository.save(existing);
    }

    public void delete(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        userRepository.deleteById(id);
    }

    /**
     * Updates the password for a user identified by their email address.
     *
     * Flow:
     *  1. Look up the user by email — 404 if not found.
     *  2. Validate new password length (min 8 chars).
     *  3. Confirm newPassword == confirmPassword — 400 if mismatch.
     *  4. Encode and persist the new password.
     *
     * @param email           the account's email address
     * @param newPassword     the desired new password (plain text)
     * @param confirmPassword must exactly match newPassword
     */
    public void updatePassword(String email, String newPassword, String confirmPassword) {

        // 1. Resolve user by email
        Users user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "No account found with that email address"));

        // 2. Validate new password
        if (newPassword == null || newPassword.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password is required");
        }

        if (newPassword.length() < 8) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Password must be at least 8 characters");
        }

        // 3. Confirm passwords match
        if (confirmPassword == null || !newPassword.equals(confirmPassword)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passwords do not match");
        }

        // 4. Encode and save
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setConfirmPassword(null);
        userRepository.save(user);
    }
}
