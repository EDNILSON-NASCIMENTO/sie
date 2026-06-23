import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { EmergencyProfile } from '../../models/emergency-profile';
import { EmergencyApiService } from '../../services/emergency-api.service';

type StatusTone = 'neutral' | 'success' | 'error' | 'warning';

@Component({
  selector: 'app-emergency-page',
  imports: [RouterLink],
  templateUrl: './emergency-page.component.html',
  styleUrl: './emergency-page.component.css'
})
export class EmergencyPageComponent implements OnInit {
  readonly loading = signal(true);
  readonly loadError = signal('');
  readonly profile = signal<EmergencyProfile | null>(null);
  readonly statusMessage = signal('Se puder, acione o contato e envie a localizacao GPS.');
  readonly statusTone = signal<StatusTone>('neutral');
  readonly sending = signal(false);
  readonly alertSent = signal(false);
  readonly needsHttpsForGps = signal(false);

  private autoSos = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly emergencyApi: EmergencyApiService
  ) {}

  ngOnInit(): void {
    this.needsHttpsForGps.set(this.detectNeedsHttps());

    const userId = this.route.snapshot.paramMap.get('userId');
    this.autoSos = this.route.snapshot.queryParamMap.get('auto') === '1';

    if (!userId) {
      this.loading.set(false);
      this.loadError.set('Identificador de usuario invalido.');
      return;
    }

    this.emergencyApi.getProfile(userId).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.loading.set(false);

        if (this.autoSos) {
          void this.enviarAlertaInicial();
        }
      },
      error: () => {
        this.loading.set(false);
        this.loadError.set(
          'Nao foi possivel carregar o perfil. Verifique se backend e frontend estao rodando.'
        );
      }
    });
  }

  async enviarAlertaInicial(): Promise<void> {
    await this.enviarAlerta({ skipGps: true, fromAutoScan: true });
    this.statusTone.set('warning');
    this.statusMessage.set(
      'Alerta enviado. Toque no botao abaixo para enviar a localizacao GPS (exige permissao do navegador).'
    );
  }

  async enviarLocalizacaoGps(): Promise<void> {
    await this.enviarAlerta({ skipGps: false, fromAutoScan: false, gpsOnly: true });
  }

  async enviarAlerta(options: {
    skipGps?: boolean;
    fromAutoScan?: boolean;
    gpsOnly?: boolean;
  } = {}): Promise<void> {
    const profile = this.profile();
    if (!profile || this.sending()) {
      return;
    }

    const skipGps = options.skipGps ?? false;
    const gpsOnly = options.gpsOnly ?? false;

    this.sending.set(true);
    this.statusTone.set('neutral');

    if (gpsOnly) {
      this.statusMessage.set('Solicitando permissao de GPS...');
    } else if (options.fromAutoScan) {
      this.statusMessage.set('QR Code detectado. Enviando alerta de emergencia...');
    } else {
      this.statusMessage.set('Solicitando permissao de GPS...');
    }

    let latitude: number | null = null;
    let longitude: number | null = null;
    let gpsError = '';

    if (!skipGps) {
      const gpsResult = await this.tentarCapturarGps();
      latitude = gpsResult.latitude;
      longitude = gpsResult.longitude;
      gpsError = gpsResult.errorMessage;

      if (!latitude && !longitude && gpsError) {
        this.statusTone.set('error');
        this.statusMessage.set(gpsError);
        this.sending.set(false);
        return;
      }
    }

    try {
      this.statusMessage.set('Enviando dados para a central...');

      const response = await firstValueFrom(
        this.emergencyApi.sendSos(profile.userId, latitude, longitude)
      );

      this.alertSent.set(true);
      this.statusTone.set('success');

      if (latitude != null && longitude != null) {
        this.statusMessage.set('Localizacao GPS enviada com sucesso.');
      } else if (skipGps) {
        this.statusMessage.set(response.message || 'Alerta inicial enviado com sucesso.');
      } else {
        this.statusMessage.set(response.message || 'Alerta enviado sem coordenadas GPS.');
      }
    } catch {
      this.statusTone.set('error');
      this.statusMessage.set('Falha ao enviar SOS. Ligue diretamente para o contato de emergencia.');
    } finally {
      this.sending.set(false);
    }
  }

  private async tentarCapturarGps(): Promise<{
    latitude: number | null;
    longitude: number | null;
    errorMessage: string;
  }> {
    if (!('geolocation' in navigator)) {
      return {
        latitude: null,
        longitude: null,
        errorMessage: 'Este navegador nao suporta geolocalizacao.'
      };
    }

    if (this.needsHttpsForGps()) {
      return {
        latitude: null,
        longitude: null,
        errorMessage:
          'GPS bloqueado em HTTP no celular. Use HTTPS (npm run start:ssl) ou teste em ahlembrei.com.br.'
      };
    }

    try {
      const position = await this.obterLocalizacao();
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        errorMessage: ''
      };
    } catch (error) {
      return {
        latitude: null,
        longitude: null,
        errorMessage: this.mapGpsError(error)
      };
    }
  }

  private obterLocalizacao(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 25000,
        maximumAge: 0
      });
    });
  }

  private mapGpsError(error: unknown): string {
    const geoError = error as GeolocationPositionError | undefined;
    switch (geoError?.code) {
      case 1:
        return 'Permissao de localizacao negada. Ative em Ajustes > Privacidade > Localizacao.';
      case 2:
        return 'Localizacao indisponivel no momento. Tente novamente ao ar livre.';
      case 3:
        return 'Tempo esgotado ao obter GPS. Tente novamente com melhor sinal.';
      default:
        return 'Nao foi possivel capturar GPS neste dispositivo.';
    }
  }

  private detectNeedsHttps(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const host = window.location.hostname;
    const isLocalHost = host === 'localhost' || host === '127.0.0.1';
    return !window.isSecureContext && !isLocalHost;
  }
}
