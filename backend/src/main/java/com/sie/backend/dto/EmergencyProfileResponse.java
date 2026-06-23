package com.sie.backend.dto;

public record EmergencyProfileResponse(
        String userId,
        String nome,
        String tipoSanguineo,
        String alergias,
        String contatoNome,
        String contatoTelefone
) {
}
