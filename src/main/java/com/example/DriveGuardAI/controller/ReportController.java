package com.example.DriveGuardAI.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.DriveGuardAI.service.ReportService;

/**
 * Controller for incident reports
 * Endpoints: /api/v1/reports/today, /api/v1/reports/weekly, /api/v1/reports/monthly
 * 
 * Save as: ~/DriveGuardAI-/src/main/java/com/example/DriveGuardAI/controller/ReportController.java
 */
@RestController
@RequestMapping("/api/v1/reports")
@CrossOrigin(originPatterns = "http://localhost:[*]", allowCredentials = "false")
public class ReportController {
    
    private final ReportService reportService;
    
    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }
    
    /**
     * Get today's incident report
     * GET /api/v1/reports/today
     * 
     * @return Report with incidents and statistics for today
     */
    @GetMapping("/today")
    public ResponseEntity<Map<String, Object>> getTodayReport() {
        try {
            System.out.println("📥 Request received: GET /api/v1/reports/today");
            Map<String, Object> report = reportService.getTodayReport();
            System.out.println("✅ Today's report generated successfully");
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            System.err.println("❌ Error generating today's report: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to generate today's report"));
        }
    }
    
    /**
     * Get weekly incident report (last 7 days)
     * GET /api/v1/reports/weekly
     * 
     * @return Report with incidents and statistics for the last 7 days
     */
    @GetMapping("/weekly")
    public ResponseEntity<Map<String, Object>> getWeeklyReport() {
        try {
            System.out.println("📥 Request received: GET /api/v1/reports/weekly");
            Map<String, Object> report = reportService.getWeeklyReport();
            System.out.println("✅ Weekly report generated successfully");
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            System.err.println("❌ Error generating weekly report: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to generate weekly report"));
        }
    }
    
    /**
     * Get monthly incident report (last 30 days)
     * GET /api/v1/reports/monthly
     * 
     * @return Report with incidents and statistics for the last 30 days
     */
    @GetMapping("/monthly")
    public ResponseEntity<Map<String, Object>> getMonthlyReport() {
        try {
            System.out.println("📥 Request received: GET /api/v1/reports/monthly");
            Map<String, Object> report = reportService.getMonthlyReport();
            System.out.println("✅ Monthly report generated successfully");
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            System.err.println("❌ Error generating monthly report: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to generate monthly report"));
        }
    }
}
