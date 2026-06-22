package com.sie.backend.controller;

import com.sie.backend.dto.SosRequest;
import com.sie.backend.dto.SosResponse;
import com.sie.backend.model.EmergencyUser;
import com.sie.backend.service.AlertDispatcher;
import com.sie.backend.service.EmergencyUserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/sos")
@CrossOrigin(origins = "*")
public class SosController {

    private final EmergencyUserService emergencyUserService;
    private final AlertDispatcher alertDispatcher;

    public SosController(EmergencyUserService emergencyUserService, AlertDispatcher alertDispatcher) {
        this.emergencyUserService = emergencyUserService;
        this.alertDispatcher = alertDispatcher;
    }

    @PostMapping("/disparar")
    public ResponseEntity<SosResponse> disparar(@Valid @RequestBody SosRequest request) {
        EmergencyUser user = emergencyUserService.findByUserId(request.userId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado"));

        alertDispatcher.dispatch(user, request.latitude(), request.longitude());

        return ResponseEntity.ok(new SosResponse(true, "Alerta enviado"));
    }
}
