import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./analytics/analytics.component').then(mod => mod.AnalyticsComponent) }
];
