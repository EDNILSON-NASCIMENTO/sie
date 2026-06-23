package com.sie.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Optional;

@Service
public class IpGeolocationService {

    private static final Logger log = LoggerFactory.getLogger(IpGeolocationService.class);
    private final RestClient restClient = RestClient.create();

    public Optional<GeoPoint> resolve(String clientIp) {
        if (clientIp == null || clientIp.isBlank() || isPrivateIp(clientIp)) {
            return Optional.empty();
        }

        try {
            GeoApiResponse response = restClient.get()
                    .uri("http://ip-api.com/json/{ip}?fields=status,lat,lon,city,regionName,country", clientIp)
                    .retrieve()
                    .body(GeoApiResponse.class);

            if (response == null || !"success".equalsIgnoreCase(response.status())) {
                return Optional.empty();
            }

            return Optional.of(new GeoPoint(
                    response.lat(),
                    response.lon(),
                    response.city() + ", " + response.regionName() + ", " + response.country()
            ));
        } catch (Exception ex) {
            log.warn("Falha ao resolver geolocalizacao por IP {}: {}", clientIp, ex.getMessage());
            return Optional.empty();
        }
    }

    private boolean isPrivateIp(String ip) {
        if (ip == null || ip.isBlank()) {
            return true;
        }

        if (ip.equals("0:0:0:0:0:0:0:1") || ip.equals("::1")) {
            return true;
        }

        if (ip.startsWith("10.") || ip.startsWith("192.168.") || ip.startsWith("127.")) {
            return true;
        }

        if (ip.startsWith("172.")) {
            String[] parts = ip.split("\\.");
            if (parts.length >= 2) {
                try {
                    int second = Integer.parseInt(parts[1]);
                    return second >= 16 && second <= 31;
                } catch (NumberFormatException ignored) {
                    return true;
                }
            }
        }

        return false;
    }

    public record GeoPoint(Double latitude, Double longitude, String label) {
    }

    private record GeoApiResponse(String status, Double lat, Double lon, String city, String regionName, String country) {
    }
}
