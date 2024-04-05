import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'inicio',
        loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
    },
    {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent)
    },
    {
        path: 'restore',
        loadComponent: () => import('./components/restore/restore.component').then(m => m.RestoreComponent)
    },
    // Dejar '**' siempre al final
    {
        path: '**',
        redirectTo: 'inicio',
        pathMatch: 'full'
    }

];
