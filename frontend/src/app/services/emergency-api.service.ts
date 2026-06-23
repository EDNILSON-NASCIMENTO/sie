import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { EmergencyProfile } from '../models/emergency-profile';

@Injectable({ providedIn: 'root' })
export class EmergencyApiService {
  private get baseUrl(): string {
    return environment.apiUrl;
  }

  constructor(private readonly http: HttpClient) {}

  getProfile(userId: string): Observable<EmergencyProfile> {
    return this.http.get<EmergencyProfile>(`${this.baseUrl}/usuarios/${userId}`);
  }

  sendSos(
    userId: string,
    latitude?: number | null,
    longitude?: number | null
  ): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.baseUrl}/sos/disparar`, {
      userId,
      latitude: latitude ?? null,
      longitude: longitude ?? null
    });
  }
}
