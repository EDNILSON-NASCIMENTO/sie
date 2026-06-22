import { HttpClient } from '@angular/common/http';
import { Component, computed, signal } from '@angular/core';

type StatusTone = 'neutral' | 'success' | 'error';

interface EmergencyProfile {
  userId: string;
  nome: string;
  tipoSanguineo: string;
  alergias: string;
  contatoNome: string;
  contatoTelefone: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private readonly apiUrl = 'http://localhost:3000/sos/disparar';

  readonly profile: EmergencyProfile = {
    userId: 'ednilson_123',
    nome: 'Ednilson N. Martiniano',
    tipoSanguineo: 'O+',
    alergias: 'Nenhuma severa registrada',
    contatoNome: 'Esposa',
    contatoTelefone: '+5511999999999'
  };

  readonly statusMessage = signal('Se puder, acione o contato e envie a localização GPS.');
  readonly statusTone = signal<StatusTone>('neutral');
  readonly printingMode = signal(false);
  readonly qrPayload = computed(() => `${window.location.origin}/?uid=${this.profile.userId}`);
  readonly qrCodeUrl = computed(
    () =>
      `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
        this.qrPayload()
      )}`
  );

  constructor(private readonly http: HttpClient) {}

  async enviarAlerta(): Promise<void> {
    this.statusTone.set('neutral');
    this.statusMessage.set('Solicitando permissão de GPS...');

    if (!('geolocation' in navigator)) {
      this.statusTone.set('error');
      this.statusMessage.set('Navegador sem suporte de geolocalização. Use o botão de ligação.');
      return;
    }

    try {
      const position = await this.obterLocalizacao();
      this.statusMessage.set('Enviando dados para a central...');

      await this.http
        .post(this.apiUrl, {
          userId: this.profile.userId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
        .toPromise();

      this.statusTone.set('success');
      this.statusMessage.set('Mensagem de socorro enviada com sucesso.');
    } catch {
      this.statusTone.set('error');
      this.statusMessage.set('Falha ao enviar SOS. Ligue diretamente para o contato de emergência.');
    }
  }

  imprimirEtiquetaTemporaria(): void {
    this.printingMode.set(true);

    setTimeout(() => {
      window.print();
      this.printingMode.set(false);
    }, 50);
  }

  private obterLocalizacao(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000
      });
    });
  }
}
