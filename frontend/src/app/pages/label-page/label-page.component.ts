import { Component, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EmergencyProfile } from '../../models/emergency-profile';
import { EmergencyApiService } from '../../services/emergency-api.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-label-page',
  imports: [RouterLink],
  templateUrl: './label-page.component.html',
  styleUrl: './label-page.component.css'
})
export class LabelPageComponent implements OnInit {
  readonly loading = signal(true);
  readonly loadError = signal('');
  readonly profile = signal<EmergencyProfile | null>(null);
  readonly printingMode = signal(false);

  readonly qrPayload = computed(() => {
    const userId = this.profile()?.userId;
    return userId ? `${environment.siteUrl}/e/${userId}?auto=1` : '';
  });

  readonly qrCodeUrl = computed(() => {
    const payload = this.qrPayload();
    return payload
      ? `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(payload)}`
      : '';
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly emergencyApi: EmergencyApiService
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('userId');
    if (!userId) {
      this.loading.set(false);
      this.loadError.set('Identificador de usuario invalido.');
      return;
    }

    this.emergencyApi.getProfile(userId).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadError.set('Perfil de emergencia nao encontrado.');
      }
    });
  }

  imprimirEtiquetaTemporaria(): void {
    this.printingMode.set(true);
    setTimeout(() => {
      window.print();
      this.printingMode.set(false);
    }, 50);
  }
}
