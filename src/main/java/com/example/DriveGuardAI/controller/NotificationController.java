package com.example.DriveGuardAI.controller;

import com.example.DriveGuardAI.model.EmailDetails;
import com.example.DriveGuardAI.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * NotificationController
 * ----------------------
 * Exposes POST /api/v1/notifications/email
 *
 * Used directly by Python api_server.py to send emails
 * without going through the full incident flow.
 *
 * Uses YOUR existing EmailService interface + EmailServiceImpl —
 * nothing new is created, just a new controller endpoint.
 */
@RestController
@RequestMapping("/api/v1/notifications")
@CrossOrigin(originPatterns = "http://localhost:[*]", allowCredentials = "false")
public class NotificationController {

    private final EmailService emailService;

    public NotificationController(EmailService emailService) {
        this.emailService = emailService;
    }

    /**
     * POST /api/v1/notifications/email
     * Body: { "recipient": "...", "subject": "...", "msgBody": "..." }
     * Called by Python api_server.py trigger_java_email() after every violation.
     */
    @PostMapping("/email")
    public ResponseEntity<Map<String, String>> sendEmail(@RequestBody EmailDetails details) {
        if (details.getRecipient() == null || details.getRecipient().isBlank()) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "recipient is required"));
        }
        if (details.getSubject() == null || details.getSubject().isBlank()) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "subject is required"));
        }
        if (details.getMsgBody() == null || details.getMsgBody().isBlank()) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "msgBody is required"));
        }

        String result = emailService.sendSimpleMail(details);
        System.out.println("📧 /notifications/email called — " + result);

        return ResponseEntity.ok(Map.of("message", result));
    }
}
