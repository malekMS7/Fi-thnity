import type { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      // Pages publiques en Lazy Loading (Code Splitting)
      {
        path: '',
        loadComponent: () => import('./pages/home.component').then((m) => m.HomeComponent),
        pathMatch: 'full',
      },
      {
        path: 'connexion',
        loadComponent: () => import('./pages/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'inscription',
        loadComponent: () => import('./pages/register.component').then((m) => m.RegisterComponent),
      },
      {
        path: 'trajets',
        loadComponent: () => import('./pages/rides.component').then((m) => m.RidesComponent),
      },
      {
        path: 'trajets/:id',
        loadComponent: () => import('./pages/ride-detail.component').then((m) => m.RideDetailComponent),
      },
      {
        path: 'contact',
        loadComponent: () => import('./pages/contact.component').then((m) => m.ContactComponent),
      },

      // Pages réservées aux utilisateurs connectés
      {
        path: 'publier',
        loadComponent: () => import('./pages/publish-ride.component').then((m) => m.PublishRideComponent),
        canActivate: [authGuard],
      },
      {
        path: 'tableau-de-bord',
        loadComponent: () => import('./pages/dashboard.component').then((m) => m.DashboardComponent),
        canActivate: [authGuard],
      },
      {
        path: 'profil',
        loadComponent: () => import('./pages/profile.component').then((m) => m.ProfileComponent),
        canActivate: [authGuard],
      },

      // Page 404 (Introuvable)
      {
        path: '**',
        loadComponent: () => import('./pages/not-found.component').then((m) => m.NotFoundComponent),
      },
    ],
  },
];
