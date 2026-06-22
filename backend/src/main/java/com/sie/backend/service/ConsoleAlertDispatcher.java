package com.sie.backend.service;

import com.sie.backend.model.EmergencyUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class ConsoleAlertDispatcher implements AlertDispatcher {

    private static final Logger log = LoggerFactory.getLogger(ConsoleAlertDispatcher.class);

    @Override
    public void dispatch(EmergencyUser user, Double latitude, Double longitude) {
        String mapsLink = "https://www.google.com/maps?q=" + latitude + "," + longitude;
        String message = "ALERTA DE EMERGENCIA: QR medico de " + user.nome()
                + " foi escaneado. Localizacao capturada: " + mapsLink;

        // Ponto de integracao: substituir este log por Twilio, Evolution API ou outro gateway.
        log.warn("Enviando alerta para {} ({}) - {}", user.nome(), user.telefoneEmergencia(), message);
    }
}
