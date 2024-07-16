import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'inicio',
    loadComponent: () =>
      import('./components/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'restore',
    loadComponent: () =>
      import('./components/restore/restore.component').then(
        (m) => m.RestoreComponent
      ),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },
  {
    path: 'publications',
    loadComponent: () =>
      import('./components/publications/publications.component').then(
        (m) => m.PublicationsComponent
      ),
  },
  {
    path: 'publications-in',
    loadComponent: () =>
      import('./components/publications-in/publications-in.component').then(
        (m) => m.PublicationsInComponent
      ),
  },
  {
    path: 'register-p2',
    loadComponent: () =>
      import('./components/register-p2/register-p2.component').then(
        (m) => m.RegisterP2Component
      ),
  },
  // Dejar '**' siempre al final
  {
    path: '**',
    redirectTo: 'inicio',
    pathMatch: 'full',
  },
  
];