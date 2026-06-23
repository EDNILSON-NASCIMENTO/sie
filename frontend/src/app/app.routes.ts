import { Routes } from '@angular/router';
import { EmergencyPageComponent } from './pages/emergency-page/emergency-page.component';
import { LabelPageComponent } from './pages/label-page/label-page.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'e/:userId', component: EmergencyPageComponent },
  { path: 'etiqueta/:userId', component: LabelPageComponent },
  { path: '**', redirectTo: '' }
];
