package com.sie.backend.service;

import com.sie.backend.config.TwilioProperties;
import com.sie.backend.model.EmergencyUser;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class SmsAlertDispatcher implements AlertDispatcher {

    private static final Logger log = LoggerFactory.getLogger(SmsAlertDispatcher.class);

    private final TwilioProperties twilioProperties;

    public SmsAlertDispatcher(TwilioProperties twilioProperties) {
        this.twilioProperties = twilioProperties;
    }

    @Override
    public void dispatch(EmergencyUser user, AlertLocation location) {
        String message = buildMessage(user.nome(), location);

        if (!twilioProperties.isConfigured()) {
            log.warn("[MODO TESTE - SMS NAO ENVIADO] Para {} ({}): {}",
                    user.nome(), user.telefoneEmergencia(), message);
            return;
        }

        Twilio.init(twilioProperties.getAccountSid(), twilioProperties.getAuthToken());

        Message sms = Message.creator(
                new PhoneNumber(user.telefoneEmergencia()),
                new PhoneNumber(twilioProperties.getFromNumber()),
                message
        ).create();

        log.info("SMS enviado para {}. SID: {}", user.telefoneEmergencia(), sms.getSid());
    }

    private String buildMessage(String nome, AlertLocation location) {
        if (location.hasCoordinates()) {
            String mapsLink = "https://www.google.com/maps?q=" + location.latitude() + "," + location.longitude();
            return "ALERTA DE EMERGENCIA: QR medico de " + nome
                    + " foi escaneado. Localizacao (" + location.source() + "): " + mapsLink;
        }

        return "ALERTA DE EMERGENCIA: QR medico de " + nome
                + " foi escaneado. Localizacao GPS ainda nao capturada.";
    }
}
