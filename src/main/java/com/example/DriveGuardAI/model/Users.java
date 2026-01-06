// package com.example.DriveGuardAI.model;

// import jakarta.persistence.*;
// import jakarta.validation.constraints.Email;
// import jakarta.validation.constraints.NotBlank;
// import jakarta.validation.constraints.Size;
// import lombok.AllArgsConstructor;
// import lombok.Data;
// import lombok.NoArgsConstructor;
// import org.hibernate.annotations.CreationTimestamp;
// import org.hibernate.annotations.UpdateTimestamp;
// import com.example.DriveGuardAI.Enum.UserRole;
// import com.example.DriveGuardAI.model.*;


// import java.time.LocalDateTime;
// import java.util.HashSet;
// import java.util.Set;

// @Entity
// @Table(name = "users", indexes = {
//     @Index(name = "idx_email", columnList = "email"),
//     @Index(name = "idx_user_role", columnList = "user_role")
// })
// @Data
// @NoArgsConstructor
// @AllArgsConstructor
// public class User {

//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     @Column(name = "id", updatable = false, nullable = false)
//     private String id;

//     @NotBlank(message = "First name is required")
//     @Size(max = 50)
//     @Column(name = "first_name", nullable = false, length = 50)
//     private String firstName;

//     @NotBlank(message = "Last name is required")
//     @Size(max = 50)
//     @Column(name = "last_name", nullable = false, length = 50)
//     private String lastName;

//     @NotBlank(message = "Email is required")
//     @Email(message = "Email should be valid")
//     @Column(name = "email", unique = true, nullable = false, length = 100)
//     private String email;

//     @NotBlank(message = "Password is required")
//     @Size(min = 8)
//     @Column(name = "password", nullable = false)
//     private String password;

//     @Size(max = 20)
//     @Column(name = "phone_number", length = 20)
//     private String phoneNumber;

//     @Enumerated(EnumType.STRING)
//     @Column(name = "user_role", nullable = false, length = 20)
//     private UserRole userRole;

//     @Column(name = "is_active")
//     private Boolean isActive = true;

//     @CreationTimestamp
//     @Column(name = "created_at", nullable = false, updatable = false)
//     private LocalDateTime createdAt;

//     @UpdateTimestamp
//     @Column(name = "updated_at")
//     private LocalDateTime updatedAt;

//     // Relationships
//     @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
//     private Drivers driver;

//     @OneToMany(mappedBy = "createdBy", cascade = CascadeType.ALL)
//     private Set<Event> createdEvents = new HashSet<>();

// }







package com.example.DriveGuardAI.model;
import java.util.List;

import com.example.DriveGuardAI.Enum.UserRole;

import jakarta.validation.constraints.*;
import jakarta.persistence.*;



@Entity
@Table(name = "users")
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "First name is required")
    @Size(max = 50)
    @Column(name = "FirstName", nullable = false, length = 50)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 50)
    @Column(name = "LastName", nullable = false, length = 50)
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Column(name = "Email", unique = true, nullable = false, length = 100)
    private String email;

    @Enumerated(EnumType.STRING)
    @NotBlank(message = "User role is required")
    @Size(max = 20)
    @Column(name = "UserRole", nullable = false, length = 20)
    private UserRole userRole;

    @Size(max = 20)
    @Column(name = "PhoneNumber", length = 20)
    private String phoneNumber;

    @NotBlank(message = "Password is required")
    @Size(min = 8)
    @Column(name = "Password", nullable = false)
    private String password;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Alters> alters;


    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public UserRole getUserRole() {
        return userRole;
    }

    public void setUserRole(UserRole userRole) {
        this.userRole = userRole;
    }

    public List<Alters> getAlters() {
        return alters;
    }

    public void setAlters(List<Alters> alters) {
        this.alters = alters;
    }



}
