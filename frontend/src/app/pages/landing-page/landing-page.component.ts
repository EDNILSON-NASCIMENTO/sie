import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent implements OnInit {
  readonly features = [
    {
      title: 'Seguranca Total',
      description: 'Seus dados protegidos com criptografia de ponta'
    },
    {
      title: 'Acesso Rapido',
      description: 'Contatos de emergencia disponiveis instantaneamente'
    },
    {
      title: 'QR Code Unico',
      description: 'Acesso via QR Code para situacoes criticas'
    },
    {
      title: 'Informacoes Medicas',
      description: 'Dados medicos importantes sempre acessiveis'
    },
    {
      title: 'Multiplos Contatos',
      description: 'Gerencie varios contatos de emergencia'
    },
    {
      title: 'Etiqueta Temporaria',
      description: 'Impressao de etiqueta com QR para uso em eventos'
    }
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const legacyUserId = this.route.snapshot.queryParamMap.get('uid');
    if (legacyUserId) {
      void this.router.navigate(['/e', legacyUserId], {
        queryParams: { auto: '1' }
      });
    }
  }
}
