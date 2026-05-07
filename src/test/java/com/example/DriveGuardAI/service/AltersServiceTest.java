package com.example.DriveGuardAI.service;

import com.example.DriveGuardAI.Enum.Alerts_Status;
import com.example.DriveGuardAI.Enum.IncidentTypes;
import com.example.DriveGuardAI.Enum.Severity;
import com.example.DriveGuardAI.model.Alters;
import com.example.DriveGuardAI.model.Incidents;
import com.example.DriveGuardAI.model.Users;
import com.example.DriveGuardAI.repository.AltersRepository;
import com.example.DriveGuardAI.repository.IncidentRepository;
import com.example.DriveGuardAI.repository.UserRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AltersService Unit Tests")
class AltersServiceTest {

    @Mock private AltersRepository   altersRepository;
    @Mock private UserRepository     userRepository;
    @Mock private IncidentRepository incidentRepository;

    @InjectMocks
    private AltersService altersService;

    private Users     validUser;
    private Incidents validIncident;
    private Alters    validAlert;

    @BeforeEach
    void setUp() {
        validUser = new Users();
        validUser.setId(1L);
        validUser.setFirstName("John");
        validUser.setLastName("Doe");
        validUser.setEmail("john.doe@example.com");

        validIncident = new Incidents();
        validIncident.setIncident_id(10L);
        validIncident.setDescription("Test incident");
        validIncident.setTimestamp("2024-01-01T09:00:00");
        validIncident.setIncident_type(IncidentTypes.PHONE_USE);
        validIncident.setSeverity(Severity.LOW);

        validAlert = new Alters();
        validAlert.setId(100L);
        validAlert.setMessage("Speeding detected");
        validAlert.setSentAt("2024-01-01T10:00:00");
        validAlert.setStatus(Alerts_Status.UNREAD);
        validAlert.setUser(validUser);
        validAlert.setIncident(validIncident);
    }

    // ─────────────────────────────────────────────
    //  findAll
    // ─────────────────────────────────────────────

    @Nested
    @DisplayName("findAll()")
    class FindAll {

        @Test
        @DisplayName("returns all alerts from repository")
        void returnsAllAlerts() {
            when(altersRepository.findAll()).thenReturn(List.of(validAlert));

            List<Alters> result = altersService.findAll();

            assertThat(result).hasSize(1).contains(validAlert);
            verify(altersRepository).findAll();
        }

        @Test
        @DisplayName("returns empty list when no alerts exist")
        void returnsEmptyList() {
            when(altersRepository.findAll()).thenReturn(List.of());

            List<Alters> result = altersService.findAll();

            assertThat(result).isEmpty();
        }
    }

    // ─────────────────────────────────────────────
    //  findById
    // ─────────────────────────────────────────────

    @Nested
    @DisplayName("findById()")
    class FindById {

        @Test
        @DisplayName("returns alert when found")
        void returnsAlertWhenFound() {
            when(altersRepository.findById(100L)).thenReturn(Optional.of(validAlert));

            Alters result = altersService.findById(100L);

            assertThat(result).isEqualTo(validAlert);
        }

        @Test
        @DisplayName("throws 404 when alert not found")
        void throwsNotFoundWhenMissing() {
            when(altersRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> altersService.findById(99L))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Alert not found");
        }
    }

    // ─────────────────────────────────────────────
    //  findByUserId
    // ─────────────────────────────────────────────

    @Nested
    @DisplayName("findByUserId()")
    class FindByUserId {

        @Test
        @DisplayName("returns alerts belonging to the given user")
        void returnsAlertsForUser() {
            when(altersRepository.findByUserId(1L)).thenReturn(List.of(validAlert));

            List<Alters> result = altersService.findByUserId(1L);

            assertThat(result).hasSize(1).contains(validAlert);
            verify(altersRepository).findByUserId(1L);
        }

        @Test
        @DisplayName("returns empty list when user has no alerts")
        void returnsEmptyListWhenNoAlerts() {
            when(altersRepository.findByUserId(1L)).thenReturn(List.of());

            List<Alters> result = altersService.findByUserId(1L);

            assertThat(result).isEmpty();
        }
    }

    // ─────────────────────────────────────────────
    //  create
    // ─────────────────────────────────────────────

    @Nested
    @DisplayName("create()")
    class Create {

        private Alters newAlert;

        @BeforeEach
        void setup() {
            newAlert = new Alters();
            newAlert.setMessage("Hard braking detected");
            newAlert.setSentAt("2024-06-01T08:30:00");
            newAlert.setStatus(Alerts_Status.UNREAD);
            newAlert.setUser(validUser);
            newAlert.setIncident(validIncident);
        }

        @Test
        @DisplayName("creates alert successfully with valid data")
        void createsAlertSuccessfully() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(validUser));
            when(incidentRepository.findById(10L)).thenReturn(Optional.of(validIncident));
            when(altersRepository.save(any(Alters.class))).thenAnswer(inv -> {
                Alters a = inv.getArgument(0);
                a.setId(200L);
                return a;
            });

            Alters result = altersService.create(newAlert);

            assertThat(result.getId()).isEqualTo(200L);
            assertThat(result.getMessage()).isEqualTo("Hard braking detected");
            assertThat(result.getUser()).isEqualTo(validUser);
            assertThat(result.getIncident()).isEqualTo(validIncident);
            verify(altersRepository).save(any(Alters.class));
        }

        @Test
        @DisplayName("forces id to null before saving — prevents id override attack")
        void forcesIdToNullBeforeSave() {
            newAlert.setId(999L);
            when(userRepository.findById(1L)).thenReturn(Optional.of(validUser));
            when(incidentRepository.findById(10L)).thenReturn(Optional.of(validIncident));
            when(altersRepository.save(any(Alters.class))).thenAnswer(inv -> inv.getArgument(0));

            altersService.create(newAlert);

            verify(altersRepository).save(argThat(a -> a.getId() == null));
        }

        @Test
        @DisplayName("throws 400 when message is null")
        void throwsWhenMessageNull() {
            newAlert.setMessage(null);

            assertThatThrownBy(() -> altersService.create(newAlert))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Message is required");
        }

        @Test
        @DisplayName("throws 400 when message is blank")
        void throwsWhenMessageBlank() {
            newAlert.setMessage("   ");

            assertThatThrownBy(() -> altersService.create(newAlert))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Message is required");
        }

        @Test
        @DisplayName("throws 400 when sentAt is null")
        void throwsWhenSentAtNull() {
            newAlert.setSentAt(null);

            assertThatThrownBy(() -> altersService.create(newAlert))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("SentAt is required");
        }

        @Test
        @DisplayName("throws 400 when sentAt is blank")
        void throwsWhenSentAtBlank() {
            newAlert.setSentAt("  ");

            assertThatThrownBy(() -> altersService.create(newAlert))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("SentAt is required");
        }

        @Test
        @DisplayName("throws 400 when status is null")
        void throwsWhenStatusNull() {
            newAlert.setStatus(null);

            assertThatThrownBy(() -> altersService.create(newAlert))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Status is required");
        }

        @Test
        @DisplayName("throws 400 when user is null")
        void throwsWhenUserNull() {
            newAlert.setUser(null);

            assertThatThrownBy(() -> altersService.create(newAlert))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("User id is required");
        }

        @Test
        @DisplayName("throws 400 when user id is null")
        void throwsWhenUserIdNull() {
            Users userWithNoId = new Users();
            userWithNoId.setId(null);
            newAlert.setUser(userWithNoId);

            assertThatThrownBy(() -> altersService.create(newAlert))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("User id is required");
        }

        @Test
        @DisplayName("throws 400 when incident is null")
        void throwsWhenIncidentNull() {
            newAlert.setIncident(null);

            assertThatThrownBy(() -> altersService.create(newAlert))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Incident id is required");
        }

        @Test
        @DisplayName("throws 400 when incident id is null")
        void throwsWhenIncidentIdNull() {
            Incidents incidentWithNoId = new Incidents();
            incidentWithNoId.setIncident_id(null);
            newAlert.setIncident(incidentWithNoId);

            assertThatThrownBy(() -> altersService.create(newAlert))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Incident id is required");
        }

        @Test
        @DisplayName("throws 400 when user id references non-existent user")
        void throwsWhenUserNotFound() {
            when(userRepository.findById(1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> altersService.create(newAlert))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("User not found");
        }

        @Test
        @DisplayName("throws 400 when incident id references non-existent incident")
        void throwsWhenIncidentNotFound() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(validUser));
            when(incidentRepository.findById(10L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> altersService.create(newAlert))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Incident not found");
        }
    }

    // ─────────────────────────────────────────────
    //  update
    // ─────────────────────────────────────────────

    @Nested
    @DisplayName("update()")
    class Update {

        @Test
        @DisplayName("updates message successfully")
        void updatesMessageSuccessfully() {
            Alters payload = new Alters();
            payload.setMessage("Updated message");

            when(altersRepository.findById(100L)).thenReturn(Optional.of(validAlert));
            when(altersRepository.save(any(Alters.class))).thenAnswer(inv -> inv.getArgument(0));

            Alters result = altersService.update(100L, payload);

            assertThat(result.getMessage()).isEqualTo("Updated message");
        }

        @Test
        @DisplayName("updates status successfully")
        void updatesStatusSuccessfully() {
            Alters payload = new Alters();
            payload.setStatus(Alerts_Status.READ);

            when(altersRepository.findById(100L)).thenReturn(Optional.of(validAlert));
            when(altersRepository.save(any(Alters.class))).thenAnswer(inv -> inv.getArgument(0));

            Alters result = altersService.update(100L, payload);

            assertThat(result.getStatus()).isEqualTo(Alerts_Status.READ);
        }

        @Test
        @DisplayName("updates sentAt successfully")
        void updatesSentAtSuccessfully() {
            Alters payload = new Alters();
            payload.setSentAt("2025-12-31T23:59:59");

            when(altersRepository.findById(100L)).thenReturn(Optional.of(validAlert));
            when(altersRepository.save(any(Alters.class))).thenAnswer(inv -> inv.getArgument(0));

            Alters result = altersService.update(100L, payload);

            assertThat(result.getSentAt()).isEqualTo("2025-12-31T23:59:59");
        }

        @Test
        @DisplayName("updates user when valid user id is provided")
        void updatesUserSuccessfully() {
            Users newUser = new Users();
            newUser.setId(2L);

            Alters payload = new Alters();
            payload.setUser(newUser);

            when(altersRepository.findById(100L)).thenReturn(Optional.of(validAlert));
            when(userRepository.findById(2L)).thenReturn(Optional.of(newUser));
            when(altersRepository.save(any(Alters.class))).thenAnswer(inv -> inv.getArgument(0));

            Alters result = altersService.update(100L, payload);

            assertThat(result.getUser()).isEqualTo(newUser);
        }

        @Test
        @DisplayName("updates incident when valid incident id is provided")
        void updatesIncidentSuccessfully() {
            Incidents newIncident = new Incidents();
            newIncident.setIncident_id(20L);
            newIncident.setDescription("New incident");

            Alters payload = new Alters();
            payload.setIncident(newIncident);

            when(altersRepository.findById(100L)).thenReturn(Optional.of(validAlert));
            when(incidentRepository.findById(20L)).thenReturn(Optional.of(newIncident));
            when(altersRepository.save(any(Alters.class))).thenAnswer(inv -> inv.getArgument(0));

            Alters result = altersService.update(100L, payload);

            assertThat(result.getIncident()).isEqualTo(newIncident);
        }

        @Test
        @DisplayName("does not overwrite fields that are null in payload")
        void doesNotOverwriteWithNullFields() {
            Alters payload = new Alters(); // all fields null

            when(altersRepository.findById(100L)).thenReturn(Optional.of(validAlert));
            when(altersRepository.save(any(Alters.class))).thenAnswer(inv -> inv.getArgument(0));

            Alters result = altersService.update(100L, payload);

            assertThat(result.getMessage()).isEqualTo("Speeding detected");
            assertThat(result.getSentAt()).isEqualTo("2024-01-01T10:00:00");
            assertThat(result.getStatus()).isEqualTo(Alerts_Status.UNREAD);
        }

        @Test
        @DisplayName("throws 404 when alert to update does not exist")
        void throwsWhenAlertNotFound() {
            when(altersRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> altersService.update(99L, new Alters()))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Alert not found");
        }

        @Test
        @DisplayName("throws 400 when new user id references non-existent user")
        void throwsWhenNewUserNotFound() {
            Users ghostUser = new Users();
            ghostUser.setId(999L);

            Alters payload = new Alters();
            payload.setUser(ghostUser);

            when(altersRepository.findById(100L)).thenReturn(Optional.of(validAlert));
            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> altersService.update(100L, payload))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("User not found");
        }

        @Test
        @DisplayName("throws 400 when new incident id references non-existent incident")
        void throwsWhenNewIncidentNotFound() {
            Incidents ghostIncident = new Incidents();
            ghostIncident.setIncident_id(999L);

            Alters payload = new Alters();
            payload.setIncident(ghostIncident);

            when(altersRepository.findById(100L)).thenReturn(Optional.of(validAlert));
            when(incidentRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> altersService.update(100L, payload))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Incident not found");
        }
    }

    // ─────────────────────────────────────────────
    //  delete
    // ─────────────────────────────────────────────

    @Nested
    @DisplayName("delete()")
    class Delete {

        @Test
        @DisplayName("deletes alert when found")
        void deletesAlertWhenFound() {
            when(altersRepository.existsById(100L)).thenReturn(true);

            altersService.delete(100L);

            verify(altersRepository).deleteById(100L);
        }

        @Test
        @DisplayName("throws 404 and never calls deleteById when alert does not exist")
        void throwsWhenAlertNotFound() {
            when(altersRepository.existsById(99L)).thenReturn(false);

            assertThatThrownBy(() -> altersService.delete(99L))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Alert not found");

            verify(altersRepository, never()).deleteById(any());
        }
    }
}
