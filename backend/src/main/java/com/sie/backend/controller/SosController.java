package com.sie.backend.controller;

import com.sie.backend.dto.SosRequest;
import com.sie.backend.dto.SosResponse;
import com.sie.backend.model.EmergencyUser;
import com.sie.backend.service.AlertLocation;
import com.sie.backend.service.EmergencyUserService;
import com.sie.backend.service.IpGeolocationService;
import com.sie.backend.service.SmsAlertDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/sos")
public class SosController {

    private final EmergencyUserService emergencyUserService;
    private final SmsAlertDispatcher alertDispatcher;
    private final IpGeolocationService ipGeolocationService;

    public SosController(
            EmergencyUserService emergencyUserService,
            SmsAlertDispatcher alertDispatcher,
            IpGeolocationService ipGeolocationService
    ) {
        this.emergencyUserService = emergencyUserService;
        this.alertDispatcher = alertDispatcher;
        this.ipGeolocationService = ipGeolocationService;
    }

    @PostMapping("/disparar")
    public ResponseEntity<SosResponse> disparar(
            @Valid @RequestBody SosRequest request,
            HttpServletRequest httpRequest
    ) {
        EmergencyUser user = emergencyUserService.findByUserId(request.userId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado"));

        AlertLocation location = resolveLocation(request, httpRequest);
        alertDispatcher.dispatch(user, location);

        String message = location.hasCoordinates()
                ? "Alerta enviado com localizacao (" + location.source() + ")"
                : "Alerta enviado sem localizacao";

        return ResponseEntity.ok(new SosResponse(true, message));
    }

    private AlertLocation resolveLocation(SosRequest request, HttpServletRequest httpRequest) {
        if (request.latitude() != null && request.longitude() != null) {
            return AlertLocation.fromGps(request.latitude(), request.longitude());
        }

        return ipGeolocationService.resolve(extractClientIp(httpRequest))
                .map(AlertLocation::fromIp)
                .orElse(AlertLocation.unavailable());
    }

    private String extractClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
