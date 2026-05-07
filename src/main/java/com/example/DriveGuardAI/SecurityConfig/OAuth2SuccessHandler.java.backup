package com.example.DriveGuardAI.SecurityConfig;

import com.example.DriveGuardAI.Enum.UserRole;
import com.example.DriveGuardAI.model.Users;
import com.example.DriveGuardAI.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    @Autowired
    private UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email     = oAuth2User.getAttribute("email");
        String firstName = oAuth2User.getAttribute("given_name");
        String lastName  = oAuth2User.getAttribute("family_name");

        // Find or create user in database
        Optional<Users> existingUser = userRepository.findByEmail(email);
        Users user;

        if (existingUser.isPresent()) {
            // User already exists — just log them in
            user = existingUser.get();
        } else {
            // First time Google login — auto-register the user
            user = new Users();
            user.setEmail(email);
            user.setFirstName(firstName != null ? firstName : "Google");
            user.setLastName(lastName != null ? lastName : "User");
            user.setUserRole(UserRole.MANAGER); // Default role for Google sign-in
            user.setPassword("GOOGLE_OAUTH2_NO_PASSWORD"); // No password needed
            userRepository.save(user);
        }

        // Generate JWT token the same way as normal login
        org.springframework.security.core.Authentication jwtAuth =
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                        email,
                        null,
                        AuthorityUtils.createAuthorityList(user.getUserRole().name())
                );

        String token = JwtProvider.generateToken(jwtAuth);

        // Redirect to React frontend with the token as a URL parameter
        // React will read it and store in localStorage
        response.sendRedirect("http://localhost:3000/oauth2/callback?token=" + token);
    }
}
