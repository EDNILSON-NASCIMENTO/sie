package com.sie.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record SosRequest(
        @NotBlank(message = "userId e obrigatorio")
        String userId,
        @Min(value = -90, message = "latitude invalida")
        @Max(value = 90, message = "latitude invalida")
        Double latitude,
        @Min(value = -180, message = "longitude invalida")
        @Max(value = 180, message = "longitude invalida")
        Double longitude
) {
}
