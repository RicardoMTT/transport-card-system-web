import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./components/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'recharge',
    loadComponent: () => import('./components/recharge.component').then(m => m.RechargeComponent)
  },
  {
    path: 'use',
    loadComponent: () => import('./components/use.component').then(m => m.UseComponent)
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];
