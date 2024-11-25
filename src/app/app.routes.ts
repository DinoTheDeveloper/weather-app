import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => 
      import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'preferences',
    loadComponent: () => 
      import('./components/multi-step-form/multi-step-form.component').then(m => m.MultiStepFormComponent)
  }
];