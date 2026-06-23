package com.sie.backend.service;

import com.sie.backend.model.EmergencyUser;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
public class EmergencyUserService {

    private final Map<String, EmergencyUser> userDb = Map.of(
            "ednilson_123",
            new EmergencyUser(
                    "ednilson_123",
                    "Ednilson N. Martiniano",
                    "O+",
                    "Nenhuma severa registrada",
                    "Contato de Teste",
                    "+5511960652530"
            )
    );

    public Optional<EmergencyUser> findByUserId(String userId) {
        return Optional.ofNullable(userDb.get(userId));
    }
}
