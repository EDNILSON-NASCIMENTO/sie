package com.sie.backend.controller;

import com.sie.backend.dto.EmergencyProfileResponse;
import com.sie.backend.model.EmergencyUser;
import com.sie.backend.service.EmergencyUserService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/usuarios")
public class UserController {

    private final EmergencyUserService emergencyUserService;

    public UserController(EmergencyUserService emergencyUserService) {
        this.emergencyUserService = emergencyUserService;
    }

    @GetMapping("/{userId}")
    public EmergencyProfileResponse getProfile(@PathVariable String userId) {
        EmergencyUser user = emergencyUserService.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado"));

        return new EmergencyProfileResponse(
                user.userId(),
                user.nome(),
                user.tipoSanguineo(),
                user.alergias(),
                user.contatoNome(),
                user.telefoneEmergencia()
        );
    }
}
