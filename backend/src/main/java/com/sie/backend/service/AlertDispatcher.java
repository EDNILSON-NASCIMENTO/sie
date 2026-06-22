package com.sie.backend.service;

import com.sie.backend.model.EmergencyUser;

public interface AlertDispatcher {
    void dispatch(EmergencyUser user, Double latitude, Double longitude);
}
