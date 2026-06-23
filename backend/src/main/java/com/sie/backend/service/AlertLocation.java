package com.sie.backend.service;

import com.sie.backend.model.EmergencyUser;

public record AlertLocation(
        Double latitude,
        Double longitude,
        String source
) {
    public static AlertLocation fromGps(Double latitude, Double longitude) {
        return new AlertLocation(latitude, longitude, "GPS");
    }

    public static AlertLocation fromIp(IpGeolocationService.GeoPoint point) {
        return new AlertLocation(point.latitude(), point.longitude(), "IP (" + point.label() + ")");
    }

    public static AlertLocation unavailable() {
        return new AlertLocation(null, null, "INDISPONIVEL");
    }

    public boolean hasCoordinates() {
        return latitude != null && longitude != null;
    }
}
